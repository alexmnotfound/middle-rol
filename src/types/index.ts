export type SpecialCrit = '-' | 'PIFIA';
export type ExtendedCriticalType = CriticalType | null | SpecialCrit;

export interface Character {
    id: string;
    name: string;
    offensiveBonus: number;
    defensiveBonus: number;
    weaponType: string;
    otherModifiers: number;
}

export type CriticalType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface AttackResult {
    roll: number;
    totalAttack: number;
    defense: number;
    netResult: number;
    isHit: boolean;
    criticalType: ExtendedCriticalType;
    simulatedMessage?: string;
    damage: number;
    armorType: string;
}

export interface CriticalResult {
    roll: number;
    effect: string;
} 