import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Landmark, FileText, AlertCircle, ShieldCheck, ChevronRight, Send, Coins } from 'lucide-react';

interface CreateCaseProps {
  userData: User;
}

export default function CreateCase({ userData }: CreateCaseProps) {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || amount <= 0) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'cases'), {
        beneficiaryId: userData.uid,
        beneficiaryName: userData.name,
        title,
        description,
        targetAmount: amount,
        currentAmount: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (error) {
      console.error("Error creating case", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-sans pb-20" dir="rtl">
       <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight leading-none">تقديم طلب مساندة</h1>
        <p className="text-slate-500 text-lg font-medium">يرجى شرح حالتك بكل شفافية ليتمكن الداعمون من مساعدتك بفعالية.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSubmit} 
            className="space-y-8 bg-white p-10 sm:p-12 rounded-[48px] shadow-sm border border-slate-200"
          >
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">عنوان الحالة</label>
              <div className="relative group">
                <FileText className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pr-16 pl-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold"
                  placeholder="مثال: سداد إيجار منزل لأسرة متعففة"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">وصف المفهوم بالتفصيل</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[32px] focus:bg-white focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold resize-none leading-relaxed"
                placeholder="اشرح الظروف والاحتياجات الماسّة، والنتائج المرجوة من الدعم..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">المبلغ المالي المطلوب (ل.س)</label>
              <div className="relative group">
                <Coins className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black tracking-tighter" dir="ltr">ل.س</span>
                <input
                  required
                  type="number"
                  min={1}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pr-16 pl-20 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none text-left font-black transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-slate-950 text-white rounded-[28px] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {loading ? (
                   <span className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    تقديم الطلب للمراجعة والتدقيق
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        <div className="space-y-10">
          <section className="bg-amber-50 p-8 sm:p-10 rounded-[40px] border border-amber-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 text-amber-600 mb-8">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black italic">إرشادات هامة</h3>
              </div>
              <ul className="space-y-6">
                {[
                  'سيتم مراجعة الطلب من قبل فريق التدقيق خلال 24 ساعة.',
                  'تأكد من صحة البيانات لتجنب رفض الطلب الدائم.',
                  'يمنع نشر أي بيانات تواصل خاصة في الوصف علناً.'
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-5 h-5 bg-amber-200/50 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    </div>
                    <span className="text-sm text-amber-900/70 font-bold leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>
          </section>

          <section className="bg-primary p-10 rounded-[40px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <ShieldCheck className="w-7 h-7" />
                   </div>
                   <h3 className="text-xl font-black tracking-tight">حماية الخصوصية</h3>
                </div>
                <p className="text-sm text-primary-light font-medium leading-relaxed">
                  نحن نلتزم بأعلى معايير حماية البيانات والخصوصية الرقمية. سيتم التفاعل معك بشكل آمن وموثوق لضمان كرامة وخصوصية كل مستفيد في سند.
                </p>
             </div>
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
           </section>
        </div>
      </div>
    </div>
  );
}
