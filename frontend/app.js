const API = 'http://localhost:3001/api';
let token = localStorage.getItem('token') || null;
let currentAccount = null;

function setAuthVisible(isAuthed){
  document.getElementById('auth-section').classList.toggle('hidden', isAuthed);
  document.getElementById('app-section').classList.toggle('hidden', !isAuthed);
}

async function api(path, { method='GET', body }={}){
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:'Erro'}));
    throw new Error(err.error || 'Erro');
  }
  return res.json().catch(()=>null);
}

// Auth
document.getElementById('register-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const data = await api('/auth/register', {method:'POST', body:{name,email,password}});
  token = data.token; localStorage.setItem('token', token);
  await loadAccounts();
  setAuthVisible(true);
});

document.getElementById('login-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('log-email').value;
  const password = document.getElementById('log-password').value;
  const data = await api('/auth/login', {method:'POST', body:{email,password}});
  token = data.token; localStorage.setItem('token', token);
  await loadAccounts();
  setAuthVisible(true);
});

document.getElementById('logout-btn').addEventListener('click', ()=>{
  token = null;
  localStorage.removeItem('token');
  setAuthVisible(false);
});

// Accounts
async function loadAccounts(){
  const list = await api('/accounts');
  const sel = document.getElementById('accounts');
  sel.innerHTML = '';
  list.forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.id; opt.textContent = acc.name;
    sel.appendChild(opt);
  });
  if (list.length) {
    currentAccount = list[0].id;
    sel.value = currentAccount;
    await loadEntries();
    await loadReport('monthly');
  }
}
document.getElementById('accounts').addEventListener('change', async (e)=>{
  currentAccount = e.target.value;
  await loadEntries();
  await loadReport('monthly');
});
document.getElementById('create-account-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('new-account-name').value.trim();
  if(!name) return alert('Informe o nome da conta');
  const acc = await api('/accounts', {method:'POST', body:{name}});
  await loadAccounts(); document.getElementById('new-account-name').value='';
  document.getElementById('accounts').value = acc.id; currentAccount = acc.id;
});
document.getElementById('invite-btn').addEventListener('click', async ()=>{
  if(!currentAccount) return;
  const email = document.getElementById('invite-email').value;
  await api(`/accounts/${currentAccount}/members`, {method:'POST', body:{email}});
  alert('Membro adicionado (se existir)');
});

// Entries
document.getElementById('add-entry-btn').addEventListener('click', async ()=>{
  if(!currentAccount) return alert('Escolha uma conta');
  const type = document.getElementById('entry-type').value;
  const title = document.getElementById('entry-title').value;
  const amount = parseFloat(document.getElementById('entry-amount').value);
  const category = document.getElementById('entry-category').value || undefined;
  const date = document.getElementById('entry-date').value || new Date().toISOString();
  if(!title || !amount) return alert('Título e valor são obrigatórios');
  await api(`/accounts/${currentAccount}/entries`, {method:'POST', body:{type,title,amount,category,date}});
  document.getElementById('entry-title').value='';
  document.getElementById('entry-amount').value='';
  document.getElementById('entry-category').value='';
  await loadEntries();
  await loadReport('monthly');
});

async function loadEntries(){
  if(!currentAccount) return;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;
  const type = document.getElementById('filter-type').value;
  const category = document.getElementById('filter-category').value;
  const params = new URLSearchParams({from,to,type,category});
  for (const [k,v] of [...params]) { if (!v) params.delete(k); }
  const items = await api(`/accounts/${currentAccount}/entries?` + params.toString());
  const tbody = document.querySelector('#entries-table tbody');
  tbody.innerHTML='';
  items.forEach(e => {
    const tr = document.createElement('tr');
    const d = new Date(e.date);
    tr.innerHTML = `
      <td>${d.toLocaleDateString()}</td>
      <td>${e.title}</td>
      <td>${e.type}</td>
      <td>${e.category||''}</td>
      <td>${e.amount.toFixed(2)}</td>
      <td><button data-id="${e.id}" class="del">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button.del').forEach(btn => {
    btn.addEventListener('click', async ()=>{
      await api(`/accounts/${currentAccount}/entries/${btn.dataset.id}`, {method:'DELETE'});
      await loadEntries(); await loadReport('monthly');
    });
  });
}

document.getElementById('load-entries-btn').addEventListener('click', loadEntries);

// Reports
async function loadReport(range){
  if(!currentAccount) return;
  const params = new URLSearchParams({ range });
  const data = await api(`/accounts/${currentAccount}/reports?` + params.toString());
  document.getElementById('summary').textContent = JSON.stringify(data, null, 2);
}
document.getElementById('daily-report-btn').addEventListener('click', ()=>loadReport('daily'));
document.getElementById('weekly-report-btn').addEventListener('click', ()=>loadReport('weekly'));
document.getElementById('monthly-report-btn').addEventListener('click', ()=>loadReport('monthly'));

// Boot
if (token) { setAuthVisible(true); loadAccounts().catch(()=>setAuthVisible(false)); }
else { setAuthVisible(false); }
