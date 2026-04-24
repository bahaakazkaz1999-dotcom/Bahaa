import React from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Case } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp, Calendar, Heart, ShieldCheck, Sparkles } from 'lucide-react';

export default function CompletedSupports() {
  const [cases, setCases] = React.useState<Case[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCompleted() {
      try {
        const q = query(collection(db, 'cases'), where('status', '==', 'completed'));
        const snap = await getDocs(q);
        setCases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Case)));
      } catch (error) {
        console.error("Error fetching completed cases", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, []);

  return (
    <div className="font-sans pb-20" dir="rtl">
      <div className="mb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
           <Sparkles className="w-3 h-3" />
           مجتمع سند المعطاء
        </div>
        <h1 className="text-[48px] font-black text-slate-900 tracking-tighter leading-none mb-4">قصص النجاح والأثر</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">بفضل الله ثم بفضل عطاء مجتمعنا، اكتملت هذه الحالات وأدخلت السرور على قلوب أصحابها، موثقين بذلك قوة التكاتف.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[48px] animate-pulse" />)}
        </div>
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-200/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-2 bg-emerald-500" />
              <div className="mb-8 flex justify-between items-start">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-9 h-9" />
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full">مكتمل بنجاح</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight min-h-[3rem] group-hover:text-primary transition-colors">{c.title}</h3>
              
              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic"><TrendingUp className="w-4 h-4" /> إجمالي المبلغ:</span>
                    <span className="text-xl font-black text-emerald-600">{c.targetAmount} ل.س</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 italic"><Calendar className="w-4 h-4" /> تاريخ الإنجاز:</span>
                    <span className="font-black text-slate-600 text-sm">{new Date(c.createdAt).toLocaleDateString('ar-SA')}</span>
                 </div>
              </div>

              <div className="mt-8 pt-6 flex items-center gap-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                   <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">موثق في سجلات سند الرقمية</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center space-y-6">
           <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-200">
              <Heart className="w-12 h-12" />
           </div>
           <p className="text-slate-300 font-black text-2xl tracking-tighter">نحن بانتظار كتابة أول قصة نجاح معاً...</p>
        </div>
      )}

      {/* Impact Stats */}
      <section className="mt-24 bg-slate-950 rounded-[64px] p-16 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute inset-0 opacity-5">
           <div className="grid grid-cols-8 gap-8">
              {[...Array(40)].map((_, i) => <div key={i} className="aspect-square border border-white rounded-[24%] scale-110 rotate-12" />)}
           </div>
        </div>
        
        <div className="relative z-10 space-y-16">
           <div className="space-y-4">
              <h2 className="text-4xl font-black italic tracking-tighter">الأثر الذي نصنعه يداً بيد</h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
              <div className="space-y-4 group">
                 <p className="text-7xl font-black text-primary leading-none group-hover:scale-110 transition-transform">{cases.length}</p>
                 <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight">حالة مكتملة</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Success Stories</p>
                 </div>
              </div>
              
              <div className="space-y-4 group">
                 <p className="text-7xl font-black text-primary leading-none group-hover:scale-110 transition-transform">{cases.reduce((sum, c) => sum + (c.targetAmount || 0), 0)}</p>
                 <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight">إجمالي الدعم (ل.س)</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Total Contributions</p>
                 </div>
              </div>
              
              <div className="space-y-4 group">
                 <p className="text-7xl font-black text-primary leading-none group-hover:scale-110 transition-transform">{(cases.length * 4.5).toFixed(0)}+</p>
                 <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight">أفراد استفادوا</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Lives Impacted</p>
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-white/5 max-w-xl mx-auto">
              <p className="text-xs text-white/40 font-bold leading-relaxed">بكل شفافية، جميع المبالغ أعلاه هي مبالغ تم تسديدها بالكامل للمستفيدين تحت إشراف فريق سند وبالتعاون مع الجهات المختصة.</p>
           </div>
        </div>
        
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      </section>
    </div>
  );
}
