import React, { useState, useEffect, useCallback } from 'react';
import { Medication, MedicationTime, MedicationStatus, User } from './types';
import AddMedicationForm from './components/AddMedicationForm';
import { getMedicationInfo } from './services/geminiService';
import Modal from './components/Modal';
import Login from './components/Login';
import { PillIcon, PlusIcon, InfoIcon, EditIcon, TrashIcon, ClockIcon, LogoutIcon } from './components/Icons';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const AVATARS: Record<string, React.ReactNode> = {
  '👵': '👵', '👴': '👴', '😊': '😊', '💖': '💖', '⭐': '⭐', '🤖': '🤖',
};

const Header: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 shadow-lg sticky top-0 z-10">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shadow-md">
          {AVATARS[user.avatarId] || '😊'}
        </div>
        <div>
          <p className="text-lg text-blue-200">Bem-vindo(a) de volta,</p>
          <h1 className="text-3xl font-extrabold">{user.name}</h1>
        </div>
      </div>
      <button 
        onClick={onLogout} 
        className="flex items-center gap-2 py-2 px-4 bg-white/20 rounded-lg hover:bg-white/30 transition"
        aria-label="Trocar perfil"
      >
        <LogoutIcon className="w-6 h-6" />
        <span className="hidden md:block font-semibold">Sair</span>
      </button>
    </div>
  </header>
);


const TimeDisplay: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-center my-8 p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto border-4 border-primary-light">
            <p className="text-xl text-gray-500 font-medium">Horário Atual</p>
            <p className="text-7xl font-bold text-text tracking-wider">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
};

const getMedicationTimeStatus = (time: string, taken: boolean, currentTime: string): MedicationStatus => {
    if (taken) return 'TAKEN';
    
    const [timeHour, timeMinute] = time.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const timeInMinutes = timeHour * 60 + timeMinute;
    const currentInMinutes = currentHour * 60 + currentMinute;
    
    if (currentInMinutes >= timeInMinutes - 5 && currentInMinutes < timeInMinutes + 15) {
        return 'DUE';
    }
    if (time < currentTime) return 'OVERDUE';
    
    return 'UPCOMING';
};

const MedicationTimeChip: React.FC<{time: MedicationTime, status: MedicationStatus, onClick: () => void}> = ({time, status, onClick}) => {
    const statusStyles: Record<MedicationStatus, string> = {
        DUE: 'bg-secondary text-black animate-pulseGlow',
        OVERDUE: 'bg-danger text-white',
        TAKEN: 'bg-gray-200 text-gray-500 line-through',
        UPCOMING: 'bg-primary-light text-primary-dark',
    };
    
    const statusText: Record<MedicationStatus, string> = {
        DUE: "HORA DE TOMAR",
        OVERDUE: "ATRASADO",
        TAKEN: "OK",
        UPCOMING: "Próximo"
    }

    return (
         <button onClick={onClick} className={`flex items-center gap-3 text-2xl font-bold py-3 px-5 rounded-full transition-transform transform hover:scale-105 ${statusStyles[status]}`}>
            <ClockIcon className="w-7 h-7" />
            <span>{time.time}</span>
            <span className="text-base font-semibold opacity-90 hidden sm:inline uppercase tracking-wider">{statusText[status]}</span>
        </button>
    )
}

const MedicationItem: React.FC<{ medication: Medication; currentTime: string; onToggleTaken: (medId: string, timeId: string) => void; onEdit: (med: Medication) => void; onDelete: (medId: string) => void; onGetInfo: (medName: string) => void;}> = ({ medication, currentTime, onToggleTaken, onEdit, onDelete, onGetInfo }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
            <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h3 className="text-4xl font-bold text-text">{medication.name}</h3>
                        {medication.dosage && <p className="text-xl text-gray-600 mt-1">{medication.dosage}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                         <button onClick={() => onGetInfo(medication.name)} className="p-3 text-primary hover:bg-primary-light rounded-full transition" aria-label={`Informações sobre ${medication.name}`}><InfoIcon className="w-8 h-8" /></button>
                         <button onClick={() => onEdit(medication)} className="p-3 text-gray-600 hover:bg-gray-200 rounded-full transition" aria-label={`Editar ${medication.name}`}><EditIcon className="w-8 h-8" /></button>
                         <button onClick={() => onDelete(medication.id)} className="p-3 text-danger hover:bg-red-100 rounded-full transition" aria-label={`Apagar ${medication.name}`}><TrashIcon className="w-8 h-8" /></button>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 sm:p-6 flex flex-wrap gap-4">
                {medication.times
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(t => (
                        <MedicationTimeChip 
                            key={t.id} 
                            time={t} 
                            status={getMedicationTimeStatus(t.time, t.taken, currentTime)} 
                            onClick={() => onToggleTaken(medication.id, t.id)}
                        />
                    ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [user, setUser] = useLocalStorage<User | null>('user', null);
    const [medications, setMedications] = useLocalStorage<Medication[]>('medications', []);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoContent, setInfoContent] = useState('');
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoMedName, setInfoMedName] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            setCurrentTime(timeString);
            
            if (timeString === '00:00') {
                resetAllTakenStatus();
            }
        }, 1000 * 30); // Check every 30 seconds for accuracy
        return () => clearInterval(timer);
    }, []);

    const resetAllTakenStatus = () => {
        setMedications(prevMeds => prevMeds.map(med => ({
            ...med,
            times: med.times.map(time => ({ ...time, taken: false }))
        })));
    };
    
    const handleSaveMedication = (medication: Medication) => {
        const isEditing = medications.some(m => m.id === medication.id);
        if (isEditing) {
            setMedications(meds => meds.map(m => (m.id === medication.id ? medication : m)));
        } else {
            setMedications(meds => [...meds, medication]);
        }
        setIsFormOpen(false);
        setMedicationToEdit(null);
    };

    const handleEdit = (med: Medication) => {
        setMedicationToEdit(med);
        setIsFormOpen(true);
    };

    const handleDelete = (medId: string) => {
        if (window.confirm("Tem certeza que deseja apagar este remédio?")) {
            setMedications(meds => meds.filter(m => m.id !== medId));
        }
    };
    
    const handleToggleTaken = (medId: string, timeId: string) => {
        setMedications(meds => meds.map(med => {
            if (med.id === medId) {
                return {
                    ...med,
                    times: med.times.map(time => {
                        if (time.id === timeId) {
                            return { ...time, taken: !time.taken };
                        }
                        return time;
                    })
                };
            }
            return med;
        }));
    };

    const handleGetInfo = useCallback(async (medName: string) => {
        setInfoMedName(medName);
        setIsInfoModalOpen(true);
        setInfoLoading(true);
        const info = await getMedicationInfo(medName);
        setInfoContent(info);
        setInfoLoading(false);
    }, []);

    const handleLogout = () => {
      if (window.confirm("Deseja sair e configurar um novo perfil? Seus remédios cadastrados serão apagados.")) {
        setUser(null);
        setMedications([]);
      }
    }

    if (!user) {
      return <Login onLogin={setUser} />;
    }

    const sortedMedications = [...medications].sort((a, b) => {
        const nextTimeA = a.times.filter(t => !t.taken && getMedicationTimeStatus(t.time, t.taken, currentTime) !== 'OVERDUE').map(t => t.time).sort()[0] || '23:59';
        const nextTimeB = b.times.filter(t => !t.taken && getMedicationTimeStatus(t.time, t.taken, currentTime) !== 'OVERDUE').map(t => t.time).sort()[0] || '23:59';
        return nextTimeA.localeCompare(nextTimeB);
    });

    return (
        <div className="min-h-screen bg-background">
            <Header user={user} onLogout={handleLogout} />
            <main className="container mx-auto p-4 md:p-8">
                <TimeDisplay />
                
                {sortedMedications.length > 0 ? (
                    <div className="space-y-6">
                        {sortedMedications.map(med => (
                            <MedicationItem 
                                key={med.id} 
                                medication={med}
                                currentTime={currentTime}
                                onToggleTaken={handleToggleTaken}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onGetInfo={handleGetInfo}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-lg">
                        <PillIcon className="w-24 h-24 mx-auto text-primary-light" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-700">Nenhum remédio cadastrado</h2>
                        <p className="mt-4 text-xl text-gray-500">Clique no botão amarelo para adicionar seu primeiro remédio.</p>
                    </div>
                )}
            </main>

            <button
                onClick={() => { setMedicationToEdit(null); setIsFormOpen(true); }}
                className="fixed bottom-8 right-8 bg-secondary text-black w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
                aria-label="Adicionar novo remédio"
            >
                <PlusIcon className="w-14 h-14" />
            </button>

            <AddMedicationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveMedication}
                medicationToEdit={medicationToEdit}
            />

            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`Sobre ${infoMedName}`}>
                {infoLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                        <p className="mt-4 text-xl text-gray-600">Buscando informações...</p>
                    </div>
                ) : (
                    <div 
                      className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto" 
                      dangerouslySetInnerHTML={{ __html: infoContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text">$1</strong>').replace(/\n/g, '<br />') }}>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;
