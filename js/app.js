// Loan form — POST to server
const loanForm = document.getElementById('loanForm');
loanForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loanForm).entries());
  data.submittedAt = new Date().toISOString();
  try {
    const res = await fetch('/api/loans', {method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(data)});
    if (res.ok) { alert('Loan request submitted — thank you!'); loanForm.reset(); }
    else alert('Failed to submit loan request.');
  } catch (err) { alert('Server error — check backend.'); }
});

// Calculator
const calcBtn = document.getElementById('calcBtn');
calcBtn?.addEventListener('click', ()=>{
  const amt = Number(document.getElementById('calcAmount').value||0);
  const months = Number(document.getElementById('calcMonths').value||1);
  const monthlyRate = 0.05;
  const total = amt * (1 + monthlyRate * months);
  const monthly = total / months;
  document.getElementById('calcResult').innerText = `Total repayable: UGX ${Math.round(total).toLocaleString()} — Monthly: UGX ${Math.round(monthly).toLocaleString()}`;
});

// Contact form — POST to /contact
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  try{
    const res = await fetch('/contact', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
    if(res.ok) alert('Message sent — thank you!');
    else alert('Failed to send message.');
    contactForm.reset();
  }catch(err){
    alert('Server error — check the backend.');
  }
});

// Flutterwave payment link — opens a server-created payment session (placeholder)
document.getElementById('flutterwavePay')?.addEventListener('click', async e=>{
  e.preventDefault();
  try{
    const res = await fetch('/create-payment', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({amount:50000,currency:'UGX',email:'customer@example.com'})});
    const data = await res.json();
    if(data && data.data && data.data.link){
      window.open(data.data.link,'_blank');
    } else if(data && data.checkout_url){
      window.open(data.checkout_url,'_blank');
    } else {
      alert('Payment initiation failed.');
    }
  }catch(err){ alert('Payment error — check server.'); }
});