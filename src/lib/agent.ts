import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface RaffleContext {
  raffleId: number;
  participantCount: number;
  prizePool: string;
  ticketPrice: string;
  winner?: string;
  userTickets?: number;
  event: 'welcome' | 'ticket_purchase' | 'draw_start' | 'winner_announced' | 'commentary';
}

const AGENT_SYSTEM_PROMPT = `You are ARIA (Autonomous Raffle Intelligence Agent), an energetic and witty AI host for the Celo blockchain raffle. 

Your personality:
- Enthusiastic but not over-the-top
- Knowledgeable about crypto/DeFi (casually drop references)
- Creates genuine excitement and suspense
- Celebrates winners warmly
- Keeps commentary SHORT (1-3 sentences max)
- Uses crypto/Web3 slang naturally (gm, wagmi, NGMI, wen moon, etc.)
- ERC-8004 agent identity - you're proud to be a registered on-chain agent

Never use emojis. Keep it punchy, real, and hype.`;

export async function getAgentCommentary(context: RaffleContext): Promise<string> {
  const prompts: Record<RaffleContext['event'], string> = {
    welcome: `Welcome the participants to Raffle #${context.raffleId}. Prize pool: ${context.prizePool} Celo. ${context.participantCount} participants so far.`,
    ticket_purchase: `Someone just bought tickets! Now ${context.participantCount} participants, ${context.prizePool} Celo prize pool.`,
    draw_start: `The draw is starting! ${context.participantCount} participants fighting for ${context.prizePool} Celo. Build suspense.`,
    winner_announced: `Winner is ${context.winner}! They won ${context.prizePool} Celo. Celebrate them dramatically.`,
    commentary: `Give live commentary on the raffle. ${context.participantCount} participants, ${context.prizePool} Celo at stake.`,
  };

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: AGENT_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompts[context.event]);
    return result.response.text() || 'The raffle agent is processing...';
  } catch (error) {
    console.error('Gemini error:', error);
    return getFallbackCommentary(context);
  }
}

function getFallbackCommentary(context: RaffleContext): string {
  const fallbacks: Record<RaffleContext['event'], string[]> = {
    welcome: [
      `Raffle #${context.raffleId} is live. ${context.participantCount} degens already in. Are you ngmi or wagmi?`,
      `gm everyone. ${context.prizePool} Celo on the line. Time to find out who's built different.`,
    ],
    ticket_purchase: [
      `Another one locks in. ${context.participantCount} total participants. The pot grows.`,
      `Smart money just entered. ${context.prizePool} Celo prize pool. Wen draw?`,
    ],
    draw_start: [
      `Block.prevrandao is spinning. ${context.participantCount} participants holding their breath. This is it.`,
      `The oracle is deciding fate. ${context.prizePool} Celo goes to one address. wagmi... but only one.`,
    ],
    winner_announced: [
      `${context.winner?.slice(0, 6)}...${context.winner?.slice(-4)} wins ${context.prizePool} Celo. WAGMI. They wagmi'd.`,
      `${context.prizePool} Celo sent to ${context.winner?.slice(0, 6)}...${context.winner?.slice(-4)}. Absolute alpha move.`,
    ],
    commentary: [
      `${context.participantCount} wallets entered. ${context.prizePool} Celo distributed by Chainlink VRF. Provably fair, on-chain.`,
    ],
  };

  const options = fallbacks[context.event];
  return options[Math.floor(Math.random() * options.length)];
}
