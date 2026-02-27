import React, { useState, useEffect } from 'react';
import * as StellarSdk from 'stellar-sdk';
import freighter from '@stellar/freighter-api';
import { Wallet, Send, RefreshCw, LogOut, ExternalLink, AlertCircle, CheckCircle2, BookOpen, ChevronDown, Download, Globe, Link2, CreditCard, PenLine, MousePointerClick, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LoginPage from './Loginpage';

// Stellar Testnet Configuration
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

export default function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string; hash?: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [fundingAccount, setFundingAccount] = useState(false);

  // Fetch balance when logged in
  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    }
  }, [publicKey]);

  // Handle login from LoginPage (Freighter provides the public key)
  const handleLogin = (pubKey: string) => {
    setPublicKey(pubKey);
    setStatus({ type: 'success', message: `Wallet connected: ${pubKey.slice(0, 6)}...${pubKey.slice(-6)}` });
  };

  const fetchBalance = async (address: string) => {
    try {
      const account = await server.loadAccount(address);
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
      setBalance(xlmBalance ? xlmBalance.balance : '0');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  const fundWithFriendbot = async () => {
    if (!publicKey) return;
    setFundingAccount(true);
    setStatus({ type: 'info', message: 'Requesting testnet XLM from Friendbot...' });
    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Friendbot request failed (${response.status})`);
      }
      await fetchBalance(publicKey);
      setStatus({ type: 'success', message: 'Account funded! 10,000 testnet XLM added to your wallet.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to fund account via Friendbot' });
    } finally {
      setFundingAccount(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setBalance(null);
    setRecipient('');
    setAmount('');
    setStatus(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !recipient || !amount) return;

    setLoading(true);
    setStatus({ type: 'info', message: 'Preparing transaction...' });

    try {
      // 1. Load source account
      const sourceAccount = await server.loadAccount(publicKey);

      // 2. Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipient,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      // 3. Sign with Freighter
      setStatus({ type: 'info', message: 'Please sign the transaction in Freighter...' });
      const xdr = transaction.toXDR();

      const signResult = await freighter.signTransaction(xdr, {
        networkPassphrase: StellarSdk.Networks.TESTNET
      });

      const signedXDR = (signResult as any).signedTxXdr || (typeof signResult === 'string' ? signResult : '');

      if (!signedXDR) {
        throw new Error('Transaction signing failed or was cancelled');
      }

      // 4. Submit to Horizon
      setStatus({ type: 'info', message: 'Submitting to network...' });
      const result = await server.submitTransaction(new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.TESTNET));

      setStatus({
        type: 'success',
        message: 'Transaction successful!',
        hash: result.hash,
      });

      // Refresh balance
      await fetchBalance(publicKey);
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.error('Transaction error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.extras?.result_codes?.operations?.[0] || error.message || 'Transaction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show login page if not authenticated
  if (!publicKey) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Stellar Pay</h1>
            <span className="text-[10px] uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">Testnet</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">Connected Account</span>
              <span className="text-sm font-mono text-indigo-400">{publicKey.slice(0, 6)}...{publicKey.slice(-6)}</span>
            </div>
            <button
              onClick={disconnectWallet}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
              title="Disconnect"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Stats & Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Balance</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {balance !== null ? parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 }) : '0.00'}
                </span>
                <span className="text-lg font-medium text-indigo-400">XLM</span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={fundWithFriendbot}
                  disabled={fundingAccount}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 text-emerald-400 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-emerald-500/20 hover:border-emerald-500/30 active:scale-[0.98]"
                >
                  {fundingAccount ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                  {fundingAccount ? 'Funding...' : 'Fund with Friendbot'}
                </button>
                <button
                  onClick={() => fetchBalance(publicKey)}
                  className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Balance
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Network Info</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500">Network</span>
                  <span className="text-slate-300">Stellar Testnet</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Base Fee</span>
                  <span className="text-slate-300">100 stroops</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Transaction Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Send className="w-32 h-32" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-8">Send Payment</h2>

              <form onSubmit={handleSend} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Recipient Address</label>
                  <input
                    type="text"
                    required
                    placeholder="G..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Amount (XLM)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0000001"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">XLM</div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !recipient || !amount}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send XLM
                </button>
              </form>

              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8"
                  >
                    <div className={`p-4 rounded-xl border flex gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                      {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
                        status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> :
                          <RefreshCw className="w-5 h-5 shrink-0 animate-spin" />}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{status.message}</p>
                        {status.hash && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs mt-2 flex items-center gap-1 hover:underline opacity-80"
                          >
                            View on Explorer <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* How to Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 hover:bg-slate-900/70 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-lg font-bold text-white">How to Use</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-medium">7 Steps</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showGuide ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900/30 border border-t-0 border-slate-800 rounded-b-2xl px-6 py-6 -mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        step: 1,
                        icon: <Download className="w-4 h-4" />,
                        title: 'Install Freighter Wallet',
                        desc: 'Install the Freighter Wallet browser extension from freighter.app.',
                        color: 'from-violet-500 to-purple-600',
                      },
                      {
                        step: 2,
                        icon: <Globe className="w-4 h-4" />,
                        title: 'Switch to Testnet',
                        desc: 'Open Freighter and switch the network to Stellar Testnet.',
                        color: 'from-blue-500 to-cyan-600',
                      },
                      {
                        step: 3,
                        icon: <Link2 className="w-4 h-4" />,
                        title: 'Connect Wallet',
                        desc: 'Click "Connect Freighter Wallet" to link your account.',
                        color: 'from-indigo-500 to-blue-600',
                      },
                      {
                        step: 4,
                        icon: <CreditCard className="w-4 h-4" />,
                        title: 'View Your Balance',
                        desc: 'Once connected, your wallet address and XLM balance will appear.',
                        color: 'from-emerald-500 to-teal-600',
                      },
                      {
                        step: 5,
                        icon: <PenLine className="w-4 h-4" />,
                        title: 'Enter Recipient',
                        desc: 'Enter the recipient\'s Testnet address (must start with G).',
                        color: 'from-amber-500 to-orange-600',
                      },
                      {
                        step: 6,
                        icon: <Send className="w-4 h-4" />,
                        title: 'Send Payment',
                        desc: 'Enter the XLM amount and click "Send Payment" to initiate.',
                        color: 'from-rose-500 to-pink-600',
                      },
                      {
                        step: 7,
                        icon: <MousePointerClick className="w-4 h-4" />,
                        title: 'Confirm & Done',
                        desc: 'Confirm in Freighter popup. A ✅ success message will confirm your transaction.',
                        color: 'from-fuchsia-500 to-purple-600',
                      },
                    ].map((item) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.step * 0.05 }}
                        className="flex items-start gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:border-slate-700/50 transition-all group/card"
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                          {item.step}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-slate-400 group-hover/card:text-indigo-400 transition-colors">{item.icon}</span>
                            <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-500">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-800/50 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            Built for Stellar Testnet • Secure with Freighter
          </div>
          <div className="flex gap-6">
            <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">Freighter Wallet</a>
            <a href="https://developers.stellar.org/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">Stellar Docs</a>
            <a href="https://stellar.org/foundation" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">Stellar Foundation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
