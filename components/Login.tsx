import React, { useState } from 'react';
import { User } from '../types';
import { PillIcon } from './Icons';

const Avatar: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
      selected ? 'bg-secondary ring-4 ring-secondary ring-offset-2' : 'bg-gray-200 hover:bg-gray-300'
    }`}
    aria-pressed={selected}
  >
    <div className="transform scale-150">{children}</div>
  </button>
);

const AVATARS: Record<string, React.ReactNode> = {
  '👵': '👵',
  '👴': '👴',
  '😊': '😊',
  '💖': '💖',
  '⭐': '⭐',
  '🤖': '🤖',
};

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('👵');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({ name: name.trim(), avatarId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md text-center">
         <PillIcon className="w-20 h-20 text-white mx-auto mb-4" />
         <h1 className="text-5xl font-bold text-white mb-2">Bem-vindo(a)!</h1>
         <p className="text-xl text-blue-200 mb-10">Vamos configurar seu perfil.</p>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="user-name" className="block text-2xl font-bold text-gray-700 mb-3 text-center">Qual o seu nome?</label>
            <input
              type="text"
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl text-center focus:ring-4 focus:ring-primary-light focus:border-primary transition"
              placeholder="Ex: Vovó Maria"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label className="block text-2xl font-bold text-gray-700 mb-4 text-center">Escolha um avatar</label>
            <div className="flex justify-center flex-wrap gap-4">
              {Object.keys(AVATARS).map((id) => (
                <Avatar key={id} selected={avatarId === id} onClick={() => setAvatarId(id)}>
                  <span className="text-4xl" aria-label={`Avatar ${id}`}>{AVATARS[id]}</span>
                </Avatar>
              ))}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!name.trim()}
            className="w-full py-4 px-8 bg-secondary text-black text-2xl font-bold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
