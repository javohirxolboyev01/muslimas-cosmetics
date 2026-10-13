import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui';
import { toast } from '@/shared/toast/toastStore';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmail('');
    toast("Obuna bo'ldingiz. Rahmat! 💗");
  };
  return (
    <section className="s flush-top">
      <div className="wrap news">
        <h2>Yangiliklar va chegirmalardan birinchi xabardor bo'ling</h2>
        <p>Yangi kelgan mahsulotlar va maxsus takliflar haqida xabar beramiz.</p>
        <form onSubmit={onSubmit}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email manzilingiz" aria-label="Email manzil" />
          <Button type="submit">Obuna bo'lish</Button>
        </form>
      </div>
    </section>
  );
}
