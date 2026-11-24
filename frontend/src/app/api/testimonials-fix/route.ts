import { db } from '@/lib/firebase';
import { collection, setDoc, doc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonials = [
      { name: 'Rathan', company: 'Tech Innovators', role: 'CEO', quote: 'This chair changed my life.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rashmi', company: 'Design Studio', role: 'Lead Designer', quote: 'The aesthetics and comfort are unmatched.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
      { name: 'Hemanth', company: 'Startup Inc', role: 'Founder', quote: 'I recommend Aveon to all my employees.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rahil', company: 'Finance Co', role: 'Analyst', quote: 'Sitting for 10 hours is no longer painful.', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop' },
      { name: 'Bavish', company: 'Logistics', role: 'Manager', quote: 'Best investment for our office.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }
    ];
    for (const t of testimonials) {
      await setDoc(doc(db, 'testimonials', t.name.toLowerCase()), {
        author: t.name,
        company: t.company,
        role: t.role,
        quote: t.quote,
        img: t.img,
        rating: 5,
        createdAt: new Date().toISOString()
      });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
