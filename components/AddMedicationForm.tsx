
import React, { useState, useEffect } from 'react';
import { Medication, MedicationTime } from '../types';
import { PlusIcon, TrashIcon } from './Icons';
import Modal from './Modal';

interface AddMedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: Medication) => void;
  medicationToEdit: Medication | null;
}

const AddMedicationForm: React.FC<AddMedicationFormProps> = ({ isOpen, onClose, onSave, medicationToEdit }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<Partial<MedicationTime>[]>([{ time: '' }]);

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name);
      setDosage(medicationToEdit.dosage);
      setTimes(medicationToEdit.times.map(t => ({ id: t.id, time: t.time, taken: t.taken })));
    } else {
      setName('');
      setDosage('');
      setTimes([{ time: '' }]);
    }
  }, [medicationToEdit, isOpen]);

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index].time = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => {
    setTimes([...times, { time: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || times.some(t => !t.time)) {
      alert('Por favor, preencha o nome do remédio e pelo menos um horário.');
      return;
    }

    const newMedication: Medication = {
      id: medicationToEdit?.id || crypto.randomUUID(),
      name,
      dosage,
      times: times.map(t => ({
        id: t.id || crypto.randomUUID(),
        time: t.time!,
        taken: t.taken || false
      }))
    };
    onSave(newMedication);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={medicationToEdit ? 'Editar Remédio' : 'Adicionar Remédio'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="med-name" className="block text-xl font-medium text-gray-700 mb-2">Nome do Remédio</label>
          <input
            type="text"
            id="med-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg text-xl focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="med-dosage" className="block text-xl font-medium text-gray-700 mb-2">Dosagem (ex: 1 comprimido, 5mg)</label>
          <input
            type="text"
            id="med-dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg text-xl focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="space-y-3">
          <label className="block text-xl font-medium text-gray-700">Horários</label>
          {times.map((time, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="time"
                value={time.time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-xl focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
              {times.length > 1 && (
                <button type="button" onClick={() => removeTimeSlot(index)} className="p-3 bg-red-100 text-danger rounded-full hover:bg-red-200">
                  <TrashIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTimeSlot} className="flex items-center gap-2 text-lg text-primary font-semibold py-2 px-4 hover:bg-primary-light rounded-lg transition">
            <PlusIcon className="w-6 h-6" />
            Adicionar Horário
          </button>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} className="py-3 px-8 bg-gray-200 text-gray-700 text-xl font-bold rounded-lg hover:bg-gray-300 transition">
            Cancelar
          </button>
          <button type="submit" className="py-3 px-8 bg-primary text-white text-xl font-bold rounded-lg hover:bg-primary-dark transition">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMedicationForm;
