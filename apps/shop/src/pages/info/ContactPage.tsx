import { useState } from 'react';
import { useShop } from '@/config/shop';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { sendToShop, telLink, type Channel } from '@/shared/lib/messenger';
import { isValidPhone, maskPhone, phoneDigits } from '@/shared/lib/phone';
import { Button, FieldRow, FormField, InfoCard, InfoCardGrid, PageHeader, Panel } from '@/shared/ui';
import './InfoPages.css';

type Errors = Partial<Record<'name' | 'phone' | 'msg', string>>;

export default function ContactPage() {
  useDocumentTitle('Aloqa');
  const SHOP = useShop();
  const [form, setForm] = useState({ name: '', phone: '', msg: '' });
  const [errors, setErrors] = useState<Errors>({});

  const update = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: k === 'phone' ? maskPhone(v) : v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const send = (ch: Channel) => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Ismingizni kiriting';
    if (!isValidPhone(form.phone)) e.phone = "Raqamni to'liq kiriting";
    if (form.msg.trim().length < 3) e.msg = 'Xabar matnini yozing';
    setErrors(e);
    const first = (['name', 'phone', 'msg'] as const).find((k) => e[k]);
    if (first) return document.getElementById(`c-${first}`)?.focus();
    sendToShop(ch, `Salom! Men ${form.name.trim()}.\nTelefon: ${maskPhone(phoneDigits(form.phone))}\n\n${form.msg.trim()}`, SHOP);
  };

  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Aloqa' }]} title="Biz bilan bog'laning" subtitle="Savol, maslahat yoki buyurtma bo'yicha yozing." />
      <InfoCardGrid className="contact-cards">
        <InfoCard icon="phone" title="Telefon"><a href={telLink(SHOP.phone)}>{SHOP.phone}</a><p>{SHOP.hours}</p></InfoCard>
        <InfoCard icon="telegram" title="Telegram"><a href={`https://t.me/${SHOP.tg}`} target="_blank" rel="noopener noreferrer">@{SHOP.tg}</a><p>Tez javob beramiz</p></InfoCard>
        <InfoCard icon="instagram" title="Instagram"><a href={`https://instagram.com/${SHOP.ig}`} target="_blank" rel="noopener noreferrer">@{SHOP.ig}</a><p>Yangi mahsulotlar va aksiyalar</p></InfoCard>
      </InfoCardGrid>

      <div className="two">
        <Panel title="Xabar yozing">
          <form noValidate onSubmit={(e) => { e.preventDefault(); send('tg'); }}>
          <FieldRow>
            <FormField label="Ismingiz" htmlFor="c-name" error={errors.name}>
              <input id="c-name" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </FormField>
            <FormField label="Telefon" htmlFor="c-phone" error={errors.phone}>
              <input id="c-phone" inputMode="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </FormField>
          </FieldRow>
          <FormField label="Xabar" htmlFor="c-msg" error={errors.msg}>
            <textarea id="c-msg" value={form.msg} onChange={(e) => update('msg', e.target.value)} />
          </FormField>
          <div className="contact-actions">
            <Button type="submit">Telegramga yuborish</Button>
            <Button variant="navy" onClick={() => send('wa')}>WhatsApp'ga yuborish</Button>
          </div>
          </form>
        </Panel>
        <Panel as="aside" title="Ish vaqti">
          <p className="muted">Har kuni {SHOP.hours}</p>
          <p className="muted" style={{ marginTop: 10 }}>{SHOP.city}, O'zbekiston</p>
        </Panel>
      </div>
    </div>
  );
}
