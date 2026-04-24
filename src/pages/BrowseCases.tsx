import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Case, Donation } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, updateDoc, increment, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Heart, CreditCard, ChevronLeft, X, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BrowseCasesProps {
  userData: User | null;
}

export default function BrowseCases({ userData }: BrowseCasesProps) {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');
  
  const [cases, setCases] = React.useState<Case[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);
  const [donationAmount, setDonationAmount] = React.useState<number>(0);
  const [donating, setDonating] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    async function fetchCases() {
      try {
        const q = query(collection(db, 'cases'), where('status', 'in', ['approved', 'completed']));
        const snap = await getDocs(q);
        const fetchedCases = snap.docs.map(d => ({ id: d.id, ...d.data() } as Case));
        setCases(fetchedCases);
        
        if (initialId) {
          const c = fetchedCases.find(i => i.id === initialId);
          if (c && c.status === 'approved') setSelectedCase(c);
        }
      } catch (error) {
        console.error("Error fetching cases", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [initialId]);

  const handleDonate = async () => {
    if (!selectedCase || !userData || donationAmount <= 0) return;
    
    const remaining = selectedCase.targetAmount - selectedCase.currentAmount;
    if (donationAmount > remaining) {
       alert(`عذراً، المبلغ المطلوب المتبقي هو ${remaining} ريال فقط.`);
       return;
    }

    setDonating(true);
    try {
      const caseRef = doc(db, 'cases', selectedCase.id);
      const userRef = doc(db, 'users', userData.uid);

      await runTransaction(db, async (transaction) => {
        const cSnap = await transaction.get(caseRef);
        if (!cSnap.exists()) throw "الحالة غير موجودة";
        
        const cData = cSnap.data() as Case;
        const newAmount = cData.currentAmount + donationAmount;
        const statusUpdate = newAmount >= cData.targetAmount ? 'completed' : 'approved';

        transaction.update(caseRef, {
          currentAmount: newAmount,
          status: statusUpdate,
          updatedAt: new Date().toISOString()
        });

        transaction.update(userRef, {
          totalDonated: increment(donationAmount)
        });

        const donationRef = doc(collection(db, 'donations'));
        transaction.set(donationRef, {
          caseId: selectedCase.id,
          donorId: userData.uid,
          donorName: userData.name,
          amount: donationAmount,
          createdAt: new Date().toISOString()
        });
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedCase(null);
        setDonationAmount(0);
        window.location.reload(); 
      }, 2000);

    } catch (error) {
      console.error("Donation failed", error);
    } finally {
      setDonating(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 border-r-8 border-primary pr-6 leading-none">استكشاف الحالات</h1>
          <p className="text-slate-500 mt-3 pr-6">تصفح الحالات التي تحتاج إلى دعمك ومشاركتك</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="بحث عن حالة..."
            className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-white border border-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {filteredCases.map((c) => (
            <motion.div
              layout
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col group"
            >
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <span className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                    c.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                  )}>
                    {c.status === 'completed' ? 'تم الاكتمال' : 'متاحة للدعم'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                    <CheckCircle className="w-3 h-3" />
                    تحقق إداري
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">{c.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">{c.description}</p>
              </div>

              <div className="p-8 pt-0 mt-auto space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ المحقق</span>
                    <span className="text-sm font-black text-slate-900">{c.currentAmount} / {c.targetAmount} ل.س</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", c.status === 'completed' ? "bg-emerald-500" : "bg-primary")}
                      style={{ width: `${(c.currentAmount / c.targetAmount) * 100}%` }}
                    />
                  </div>
                </div>

                {userData?.role === 'donor' && c.status === 'approved' ? (
                  <button
                    onClick={() => setSelectedCase(c)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    المساهمة في الخير
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-center cursor-not-allowed">
                     {c.status === 'completed' ? 'تكتمل مبلغ الدعم' : 'قيد المراجعة'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Donation Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !donating && setSelectedCase(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              {success ? (
                <div className="py-12 text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -45 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-lg shadow-emerald-100 border-4 border-white"
                  >
                    <CheckCircle className="w-12 h-12" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">شكراً لعطائك!</h2>
                  <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">تم تسجيل تبرعك بنجاح، مساهمتك ستغير حياة شخص للأفضل.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <button onClick={() => setSelectedCase(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">تأكيد المساهمة</h2>
                  <p className="text-slate-500 mb-8 leading-relaxed">أنت الآن تساهم في حالة: <span className="text-primary font-bold">{selectedCase.title}</span></p>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">مبلغ الدعم (بالليرة السورية)</label>
                      <div className="relative group">
                        <input
                          autoFocus
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-6 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-2xl text-3xl font-black text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all group-hover:bg-white"
                          value={donationAmount || ''}
                          onChange={(e) => setDonationAmount(Number(e.target.value))}
                          dir="ltr"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">ل.س</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold px-2">المتبقي للحالة: {selectedCase.targetAmount - selectedCase.currentAmount} ل.س</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[50, 100, 500, 1000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDonationAmount(amt)}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border",
                            donationAmount === amt ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary-light"
                          )}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>

                    <p className="text-center text-[11px] text-slate-500 font-bold bg-slate-100 p-4 rounded-2xl border border-slate-200">
                      رقم الحساب للتحويل (سيريتل كاش): <span className="text-primary select-all">09XXXXXXXX</span>
                      <br/>
                      بمجرد إرسال الحوالة، انقر على الزر أدناه وسيتم احتساب المساهمة فوراً.
                    </p>
                    <button
                      onClick={handleDonate}
                      disabled={donating || !donationAmount || donationAmount > (selectedCase.targetAmount - selectedCase.currentAmount)}
                      className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                    >
                      {donating ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Heart className="w-6 h-6 fill-current" />
                          لقد قمت بالتحويل - تأكيد
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
