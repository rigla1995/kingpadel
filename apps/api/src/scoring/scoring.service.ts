import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoringService {
  private readonly K = 32;

  calculateEloChange(winnerElo: number, loserElo: number): { winnerChange: number; loserChange: number } {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const winnerChange = Math.round(this.K * (1 - expectedWinner));
    const loserChange = Math.round(this.K * (0 - expectedLoser));

    return { winnerChange, loserChange };
  }
}
