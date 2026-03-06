// =============================================================================
// CALIPE DIGITAL — Página de Checkout
// Arquivo: frontend/src/pages/public/CheckoutPage.jsx
// =============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ordersAPI } from '@/services/api';
import useCartStore from '@/store/cartStore';

export default function CheckoutPage() {
  const navigate   = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const [step,    setStep]    = useState(1); // 1=endereço, 2=pagamento, 3=sucesso
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [address, setAddress] = useState({
    street: '', number: '', complement: '', district: '', city: '', state: 'LU', zipcode: '',
  });
  const [payment, setPayment] = useState('pix');

  const SHIPPING = 1500;
  const sub      = subtotal();

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        address,
        payment_method: payment,
      });
      setOrderId(res.data.order_id);
      clearCart();
      setStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <div className="page-container py-20 text-center animate-slide-up">
      <div className="card max-w-md mx-auto p-10">
        <CheckCircle size={56} className="text-eucalyptus-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-silver-800 mb-2">Pedido Confirmado! 🌿</h2>
        <p className="text-silver-500 mb-1">Pedido #{orderId}</p>
        <p className="text-sm text-silver-400 mb-6">Receberá uma confirmação em breve.</p>
        <button onClick={() => navigate('/orders')} className="btn-primary w-full py-3">
          Ver Meus Pedidos
        </button>
        <button onClick={() => navigate('/products')} className="btn-ghost w-full mt-2">
          Continuar Comprando
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-silver-800 mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Endereço */}
          <div className="card p-6">
            <h2 className="font-bold text-silver-800 mb-4">1. Endereço de Entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['street',     'Rua',         'col-span-2'],
                ['number',     'Número',       ''],
                ['complement', 'Complemento', ''],
                ['district',   'Bairro',       ''],
                ['city',       'Cidade',       ''],
                ['state',      'Província',    ''],
                ['zipcode',    'CEP/Código',   ''],
              ].map(([key, label, extra]) => (
                <div key={key} className={extra}>
                  <label className="label">{label}</label>
                  <input className="input" value={address[key]}
                    onChange={e => setAddress({ ...address, [key]: e.target.value })}
                    placeholder={label} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagamento */}
          <div className="card p-6">
            <h2 className="font-bold text-silver-800 mb-4">2. Forma de Pagamento</h2>
            <div className="space-y-2">
              {[['pix', '🔑 PIX (Desconto 5%)'], ['cartao', '💳 Cartão de Crédito'], ['boleto', '📄 Referência Multicaixa']].map(([val, label]) => (
                <label key={val}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payment === val ? 'border-eucalyptus-500 bg-eucalyptus-50' : 'border-silver-200 hover:border-eucalyptus-200'
                  }`}>
                  <input type="radio" name="payment" value={val} checked={payment === val}
                    onChange={() => setPayment(val)} className="accent-eucalyptus-500" />
                  <span className="text-sm font-medium text-silver-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold text-silver-800 mb-4">Resumo</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map(i => (
              <div key={i.id} className="flex justify-between text-silver-600">
                <span className="truncate mr-2">{i.name} ×{i.quantity}</span>
                <span className="shrink-0">
                  {((i.sale_price ?? i.price) * i.quantity).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-silver-600 border-t border-eucalyptus-100 pt-2 mt-2">
              <span>Frete</span>
              <span>{SHIPPING.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
            </div>
            <div className="flex justify-between font-bold text-silver-800 border-t border-eucalyptus-100 pt-2">
              <span>Total</span>
              <span className="text-eucalyptus-700">
                {(sub + SHIPPING).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
              </span>
            </div>
          </div>
          <button onClick={handlePlaceOrder} disabled={loading || items.length === 0}
            className="btn-primary w-full py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
