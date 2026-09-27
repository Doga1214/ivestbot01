import { ChatMessage, ChatAction, QuickPrompt } from '../types/chat';
import { walletService } from './walletService';
import { luckySpinService } from './luckySpinService';
import { levelService } from './levelService';
import { referralService } from './referralService';

const CHAT_STORAGE_KEY_PREFIX = 'ivestbot_chat_history_';

export const DEFAULT_QUICK_PROMPTS: QuickPrompt[] = [
  { id: '1', icon: '💰', title: 'Check My Balance', query: 'What is my current balance?' },
  { id: '2', icon: '📥', title: 'How to Deposit?', query: 'How do I deposit USDT?' },
  { id: '3', icon: '📤', title: 'Withdrawal Rules', query: 'What are the withdrawal rules?' },
  { id: '4', icon: '🎡', title: 'Lucky Spin Info', query: 'How does Lucky Spin work?' },
  { id: '5', icon: '⭐', title: 'VIP Level Rates', query: 'What are the VIP levels and requirements?' },
  { id: '6', icon: '👥', title: 'Referral Rewards', query: 'How does the referral bonus work?' },
  { id: '7', icon: '👨‍💻', title: 'Live Admin Support', query: 'I need to contact human support.' }
];

class ChatService {
  /**
   * Get chat history for a specific user
   */
  public getHistory(userId: string = 'guest'): ChatMessage[] {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY_PREFIX + userId);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }

    // Default welcome message
    return [
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: `👋 **Welcome to Ivestbot 24/7 AI Support!**\n\nI am your automated financial assistant. You can ask me about:\n• **Wallet & Deposits / Withdrawals**\n• **Reservation & Staking Earnings**\n• **Lucky Spin Multipliers (up to 50x)**\n• **VIP Level Upgrade Requirements**\n• **Referral Earnings & Team Commissions**\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
        quickReplies: ['Check My Balance', 'How to Deposit?', 'Lucky Spin Info', 'VIP Level Rates']
      }
    ];
  }

  /**
   * Save chat history for a user
   */
  public saveHistory(userId: string = 'guest', messages: ChatMessage[]): void {
    try {
      // Keep last 50 messages to keep storage light
      const trimmed = messages.slice(-50);
      localStorage.setItem(CHAT_STORAGE_KEY_PREFIX + userId, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }

  /**
   * Clear chat history
   */
  public clearHistory(userId: string = 'guest'): void {
    localStorage.removeItem(CHAT_STORAGE_KEY_PREFIX + userId);
  }

  /**
   * Process user input and produce an intelligent context-aware response
   */
  public async processMessage(
    userText: string,
    currentUser: { id: string; username?: string; email?: string; level?: number } | null
  ): Promise<ChatMessage> {
    const q = userText.toLowerCase().trim();
    const userId = currentUser?.id;
    let replyText = '';
    let actions: ChatAction[] | undefined = undefined;
    let quickReplies: string[] | undefined = undefined;

    // 1. Balance / Wallet Query
    if (
      q.includes('balance') ||
      q.includes('paisa') ||
      q.includes('wallet') ||
      q.includes('funds') ||
      q.includes('kitna balance') ||
      q.includes('my money')
    ) {
      if (userId) {
        const wallet = walletService.getWalletForUser(userId);
        replyText = `💳 **Your Live Wallet Summary:**\n\n• **Available Balance:** \`$${wallet.availableBalance.toFixed(2)} USDT\`\n• **Reserved / Staked:** \`$${wallet.lockedBalance.toFixed(2)} USDT\`\n• **Total Deposits:** \`$${wallet.totalDeposited.toFixed(2)} USDT\`\n• **Total Withdrawn:** \`$${wallet.totalWithdrawn.toFixed(2)} USDT\`\n\nYou can recharge or withdraw anytime from your Wallet dashboard.`;
        actions = [
          { label: 'Go to Wallet', type: 'navigate', payload: '/wallet' },
          { label: 'Deposit USDT', type: 'navigate', payload: '/wallet' }
        ];
        quickReplies = ['How to Deposit?', 'Withdrawal Rules', 'Lucky Spin Info'];
      } else {
        replyText = `🔒 Please **Log In** to view your real-time wallet balance and transaction history.`;
        actions = [{ label: 'Log In Now', type: 'quick_reply', payload: 'login' }];
      }
    }

    // 2. Deposit Questions
    else if (
      q.includes('deposit') ||
      q.includes('recharge') ||
      q.includes('add money') ||
      q.includes('topup') ||
      q.includes('paisa kaise dale') ||
      q.includes('trc20') ||
      q.includes('bep20')
    ) {
      replyText = `📥 **How to Deposit USDT:**\n\n1. Go to the **Wallet** page and select the **Deposit** tab.\n2. Choose your network: **USDT-TRC20** or **USDT-BEP20**.\n3. Copy the system deposit address or scan the QR Code.\n4. Send funds from your crypto exchange (Binance, OKX, Trust Wallet, etc.).\n5. Enter the **Transaction Hash (TxID)** and submit the receipt.\n\n⏱️ Deposits are verified and credited within 2–15 minutes.`;
      actions = [{ label: 'Open Deposit Page', type: 'navigate', payload: '/wallet' }];
      quickReplies = ['Check My Balance', 'Withdrawal Rules', 'Contact Live Admin'];
    }

    // 3. Withdrawal Questions
    else if (
      q.includes('withdraw') ||
      q.includes('nikal') ||
      q.includes('cashout') ||
      q.includes('payout') ||
      q.includes('nikale')
    ) {
      replyText = `📤 **Withdrawal Policy & Rules:**\n\n• **Minimum Withdrawal:** \`$10.00 USDT\`\n• **Processing Time:** Instant to 2 hours (automated blockchain settlement).\n• **Supported Networks:** USDT (TRC-20 / BEP-20).\n• **Security:** Ensure you have bound your correct USDT wallet address in your Profile.\n\n⚠️ Ensure your account has sufficient unreserved Available Balance before requesting.`;
      actions = [{ label: 'Go to Withdraw', type: 'navigate', payload: '/wallet' }];
      quickReplies = ['Check My Balance', 'How to Deposit?', 'Talk to Support'];
    }

    // 4. Lucky Spin Wheel Questions
    else if (
      q.includes('spin') ||
      q.includes('wheel') ||
      q.includes('lucky') ||
      q.includes('wheel rules') ||
      q.includes('jackpot')
    ) {
      let spinDetails = '';
      if (userId) {
        const spinState = luckySpinService.getUserSpinState(userId, currentUser?.level || 1);
        spinDetails = `\n\n🎯 **Your Spin Status:**\n• Available Free Spins: **${spinState.availableSpins}**\n• Daily Free Spin Claimable: **${spinState.canClaimDailySpin ? '✅ YES! Claim now' : '⏳ Cooldown active'}**`;
      }

      replyText = `🎡 **Ivestbot Lucky Spin Wheel:**\n\n• **Daily Free Spin:** Every member receives free daily spins based on their VIP tier.\n• **Multipliers:** Win up to **50.0x Mega Payout** on your stake!\n• **Flexible Stakes:** Play with stakes from $1 USDT up to $100 USDT for unlimited continuous spins.\n• **Instant Credit:** Winnings are directly added to your available balance.${spinDetails}`;
      actions = [{ label: 'Play Lucky Spin', type: 'navigate', payload: '/' }];
      quickReplies = ['Check My Balance', 'VIP Level Rates', 'Referral Rewards'];
    }

    // 5. VIP Levels / Upgrades
    else if (
      q.includes('vip') ||
      q.includes('level') ||
      q.includes('tier') ||
      q.includes('upgrade') ||
      q.includes('rank')
    ) {
      const allLevels = levelService.getAllLevelRequirements();
      let levelsSummary = allLevels
        .map(
          (l) =>
            `• **${l.title} (VIP ${l.level}):** Min $${l.minWalletUSDT} USDT ${
              l.requiredAMembers > 0 ? `+ ${l.requiredAMembers} Direct Team` : ''
            }`
        )
        .join('\n');

      replyText = `⭐ **Ivestbot VIP Levels & Requirements:**\n\n${levelsSummary}\n\n💡 Higher VIP levels unlock higher daily reservation yield percentages, exclusive daily spin allowances, and priority withdrawals!`;
      actions = [{ label: 'View Profile & VIP', type: 'navigate', payload: '/profile' }];
      quickReplies = ['Reservation Earnings', 'Referral Rewards', 'Check My Balance'];
    }

    // 6. Reservation / Staking / Plans
    else if (
      q.includes('reservation') ||
      q.includes('stake') ||
      q.includes('staking') ||
      q.includes('invest') ||
      q.includes('plan') ||
      q.includes('earning') ||
      q.includes('profit') ||
      q.includes('daily return')
    ) {
      replyText = `📈 **Reservation & Automated Trading:**\n\n• Lock your USDT in quantified automated AI trading bots.\n• Earn **daily passive income (1.5% - 4.5% daily)** depending on your active plan.\n• Principal + interest are automatically credited upon maturity.\n• Multiple staking slots available simultaneously.`;
      actions = [{ label: 'Explore Reservations', type: 'navigate', payload: '/reservation' }];
      quickReplies = ['VIP Level Rates', 'How to Deposit?', 'Referral Rewards'];
    }

    // 7. Referral / Team / Invite Link
    else if (
      q.includes('refer') ||
      q.includes('invite') ||
      q.includes('team') ||
      q.includes('commission') ||
      q.includes('affiliate') ||
      q.includes('dost') ||
      q.includes('share')
    ) {
      let refCodeInfo = '';
      if (userId) {
        const refData = referralService.getReferralData(userId);
        refCodeInfo = `\n\n🔗 **Your Referral Code:** \`${refData.referralCode}\`\n👥 **Total Team Members:** **${refData.totalTeamCount}**\n💰 **Total Commission Earned:** **$${refData.totalCommissionEarned.toFixed(2)} USDT**`;
      }

      replyText = `👥 **3-Tier Referral Rewards Program:**\n\n• **Tier 1 (Direct Referrals):** Earn **10%** commission on recharge & trading.\n• **Tier 2 (Indirect Team):** Earn **5%** commission.\n• **Tier 3 (Sub-team):** Earn **2%** commission.\n\n🎁 Bonus: Get free Lucky Spin attempts for every team member who completes their first deposit!${refCodeInfo}`;
      actions = [{ label: 'Get My Invite Link', type: 'navigate', payload: '/referrals' }];
      quickReplies = ['Check My Balance', 'VIP Level Rates', 'Lucky Spin Info'];
    }

    // 8. Human Support / Telegram / Admin Contact
    else if (
      q.includes('admin') ||
      q.includes('human') ||
      q.includes('contact') ||
      q.includes('support') ||
      q.includes('telegram') ||
      q.includes('whatsapp') ||
      q.includes('help') ||
      q.includes('madad') ||
      q.includes('complaint') ||
      q.includes('issue')
    ) {
      replyText = `👨‍💻 **Official Customer Support Channels:**\n\nIf you have a deposit delay, verification issue, or custom inquiry, our official human support staff is ready to help 24/7.\n\n• **Telegram Official Channel:** [@IvestbotOfficial](https://t.me/ivestbotofficial)\n• **Direct Telegram Support:** [@IvestbotSupport](https://t.me/ivestbotsupport)\n• **Official Email:** \`support@ivestbot.io\`\n\n⚠️ *Warning:* Admins will never ask for your password or private keys!`;
      actions = [
        { label: 'Open Telegram Support', type: 'link', payload: 'https://t.me/ivestbotsupport' },
        { label: 'Telegram Community', type: 'link', payload: 'https://t.me/ivestbotofficial' }
      ];
      quickReplies = ['Check My Balance', 'How to Deposit?', 'Withdrawal Rules'];
    }

    // 9. Greetings & Polite chat
    else if (
      q.includes('hi') ||
      q.includes('hello') ||
      q.includes('hey') ||
      q.includes('namaste') ||
      q.includes('kya hal') ||
      q.includes('good morning') ||
      q.includes('good evening')
    ) {
      const name = currentUser?.username || 'Investor';
      replyText = `Hello **${name}**! 👋\n\nI am here to assist you with everything on **Ivestbot**. How can I help you today?`;
      quickReplies = ['Check My Balance', 'How to Deposit?', 'Lucky Spin Info', 'VIP Level Rates'];
    }

    // 10. Fallback / Default AI response with quick options
    else {
      replyText = `I understand you are asking about *"**${userText}**"*. \n\nHere are some popular topics I can immediately assist you with, or you can connect with our live human support team on Telegram.`;
      actions = [
        { label: 'Telegram Live Support', type: 'link', payload: 'https://t.me/ivestbotsupport' },
        { label: 'View All FAQs', type: 'navigate', payload: '/policy' }
      ];
      quickReplies = ['Check My Balance', 'How to Deposit?', 'Withdrawal Rules', 'Lucky Spin Info', 'Live Admin Support'];
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toISOString(),
      actions,
      quickReplies
    };
  }
}

export const chatService = new ChatService();
