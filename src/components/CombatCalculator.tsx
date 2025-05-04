import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    Input,
    FormControl,
    FormLabel,
    HStack,
    Select
} from '@chakra-ui/react';
import { AttackResult, CriticalType } from '../types';
import { tablaFilo, tablaContundente, tablaDosManos, tablaProyectiles, tablaGarrasDientes, tablaAgarrarDeseq } from '../tablasAtaque';
import { tablaCriticosTajo, tablaCriticosAplastamiento, tablaCriticosPerforacion, tablaCriticosDesequilibrio } from '../tablasCriticos';

type ArmorKey = 'CO' | 'CM' | 'CE' | 'CU' | 'SA';
type TablaRow = { min: number; max: number; CO: string | number; CM: string | number; CE: string | number; CU: string | number; SA: string | number; };
type Tabla = TablaRow[];
type SpecialCrit = '-' | 'PIFIA';
type ExtendedCriticalType = CriticalType | null | SpecialCrit;

const weaponTypes = [
    { value: 'filo', label: 'De filo', tabla: tablaFilo },
    { value: 'contundente', label: 'Contundente', tabla: tablaContundente },
    { value: 'dos_manos', label: 'A dos manos', tabla: tablaDosManos },
    { value: 'proyectiles', label: 'Proyectiles', tabla: tablaProyectiles },
    { value: 'garras_dientes', label: 'Garras y dientes', tabla: tablaGarrasDientes },
    { value: 'agarrar_deseq', label: 'Agarrar y desequilibrar', tabla: tablaAgarrarDeseq },
    { value: 'asta', label: 'Armas de asta' },
    { value: 'arrojadiza', label: 'Arrojadiza' }
];

const spellTypes = [
    { value: 'dirigido', label: 'Dirigido' },
    { value: 'base', label: 'Base' }
];

const armorTypes = [
    { value: 'sin', label: 'Sin armadura', key: 'CO' },
    { value: 'cuero_blando', label: 'Cuero blando', key: 'CO' },
    { value: 'cuero_rigido', label: 'Cuero rígido', key: 'CM' },
    { value: 'malla', label: 'Cota de malla', key: 'CE' },
    { value: 'escamas', label: 'Cota de escamas', key: 'CU' },
    { value: 'placas', label: 'Placas', key: 'SA' }   
];

const critTables = [
    { value: 'tajo', label: 'Tajo', tabla: tablaCriticosTajo },
    { value: 'aplastamiento', label: 'Aplastamiento', tabla: tablaCriticosAplastamiento },
    { value: 'perforacion', label: 'Perforación', tabla: tablaCriticosPerforacion },
    { value: 'desequilibrio', label: 'Desequilibrio', tabla: tablaCriticosDesequilibrio }
];

// Estructura para tablas de ataque y críticos por sistema
const tablasAtaque = {
    rolemaster: {
        filo: tablaFilo,
        contundente: tablaContundente,
        dos_manos: tablaDosManos,
        proyectiles: tablaProyectiles,
        garras_dientes: tablaGarrasDientes,
        agarrar_deseq: tablaAgarrarDeseq
        // ...etc
    },
    merp: {
        filo: undefined, // tablaFiloMERP,
        contundente: undefined, // tablaContundenteMERP,
        dos_manos: undefined, // tablaDosManosMERP,
        proyectiles: undefined, // tablaProyectilesMERP,
        garras_dientes: undefined, // tablaGarrasDientesMERP,
        agarrar_deseq: undefined // tablaAgarrarDeseqMERP
        // ...etc
    }
};

const tablasCriticos = {
    rolemaster: {
        tajo: tablaCriticosTajo,
        aplastamiento: tablaCriticosAplastamiento,
        perforacion: tablaCriticosPerforacion,
        desequilibrio: tablaCriticosDesequilibrio
    },
    merp: {
        tajo: undefined, // tablaCriticosTajoMERP,
        aplastamiento: undefined, // tablaCriticosAplastamientoMERP,
        perforacion: undefined, // tablaCriticosPerforacionMERP,
        desequilibrio: undefined // tablaCriticosDesequilibrioMERP
    }
};

function lookupTabla(tabla: Tabla, netResult: number, armorKey: ArmorKey | undefined): string | number {
    if (!armorKey) return '-';
    // Si la tirada es menor al mínimo, devuelve la primera fila
    if (netResult < tabla[0].min) return tabla[0][armorKey] ?? '-';
    // Si la tirada es mayor al máximo, devuelve la última fila
    if (netResult > tabla[tabla.length - 1].max) return tabla[tabla.length - 1][armorKey] ?? '-';
    const fila = tabla.find((row) => netResult >= row.min && netResult <= row.max);
    if (!fila) return '-';
    return fila[armorKey] ?? '-';
}

function parseResultadoTabla(valor: string | number) {
    if (typeof valor === 'number') return { damage: valor, crit: null as ExtendedCriticalType };
    if (typeof valor === 'string') {
        if (valor === '-' || valor === 'PIFIA') return { damage: 0, crit: valor as SpecialCrit };
        const match = valor.match(/(\d+)([A-E])?/);
        if (match) {
            return {
                damage: parseInt(match[1], 10),
                crit: (match[2] as CriticalType) || null
            };
        }
    }
    return { damage: 0, crit: null as ExtendedCriticalType };
}

export const CombatCalculator: React.FC = () => {
    const [attackRoll, setAttackRoll] = useState<number>(0);
    const [offensiveBonus, setOffensiveBonus] = useState<number>(0);
    const [defensiveBonus, setDefensiveBonus] = useState<number>(0);
    const [result, setResult] = useState<AttackResult & { criticalType: ExtendedCriticalType } | null>(null);

    // DICE ROLLER STATE
    const [diceType, setDiceType] = useState<string>('d6');
    const [diceResult, setDiceResult] = useState<number | null>(null);

    // Tipo de ataque
    const [attackType, setAttackType] = useState<'arma' | 'sortilegio'>('arma');
    const [subType, setSubType] = useState<string>(weaponTypes[0].value);

    // Tipo de armadura
    const [armorType, setArmorType] = useState<string>(armorTypes[0].value);

    // Estado para la consulta de críticos
    const [critRoll, setCritRoll] = useState<number>(0);
    const [critType, setCritType] = useState<string>('tajo');
    const [critResult, setCritResult] = useState<string>('');

    // Estado para el sistema seleccionado
    const [sistema, setSistema] = useState<'rolemaster' | 'merp'>('rolemaster');

    // Sincronizar tipo de crítico con tipo de arma
    useEffect(() => {
        if (attackType === 'arma') {
            if (subType === 'filo') setCritType('tajo');
            else if (subType === 'contundente') setCritType('aplastamiento');
        }
    }, [attackType, subType]);

    const rollD100 = (): number => {
        return Math.floor(Math.random() * 100) + 1;
    };

    // Cálculo usando tabla
    const calculateAttack = () => {
        const roll = attackRoll || rollD100();
        const totalAttack = roll + offensiveBonus;
        const netResult = totalAttack - defensiveBonus;
        let tabla: Tabla | null = null;
        let armorKey: ArmorKey | undefined = armorTypes.find(a => a.value === armorType)?.key as ArmorKey | undefined;
        let valorTabla: string | number | null = null;
        let simulatedMessage = '';
        let damage = 0;
        let crit: ExtendedCriticalType = null;

        // Buscar la tabla correspondiente según el tipo de arma
        const weaponTable = tablasAtaque[sistema][subType as keyof typeof tablasAtaque[typeof sistema]];
        if (attackType === 'arma' && weaponTable) {
            tabla = weaponTable;
            valorTabla = lookupTabla(tabla as Tabla, netResult, armorKey);
            const parsed = parseResultadoTabla(valorTabla);
            damage = parsed.damage;
            crit = parsed.crit;
            simulatedMessage = `Resultado de tabla: ${valorTabla}`;
        } else {
            // Para otros tipos, usar la simulación anterior
            damage = netResult > 0 ? netResult : 0;
            crit = null;
            simulatedMessage = 'Simulación simple (sin tabla)';
        }

        const result: AttackResult & { criticalType: ExtendedCriticalType } = {
            roll,
            totalAttack,
            defense: defensiveBonus,
            netResult,
            isHit: damage > 0,
            criticalType: crit,
            simulatedMessage,
            damage,
            armorType
        };

        setResult(result);
        setAttackRoll(roll);
    };

    // DICE ROLLER LOGIC
    const diceMax = {
        d4: 4,
        d6: 6,
        d8: 8,
        d10: 10,
        d12: 12,
        d20: 20,
        d100: 100
    };

    const handleDiceRoll = () => {
        const max = diceMax[diceType as keyof typeof diceMax];
        const value = Math.floor(Math.random() * max) + 1;
        setDiceResult(value);
    };

    function lookupCrit(tabla: { min: number; max: number; texto: string }[], roll: number): string {
        if (roll < tabla[0].min) return tabla[0].texto;
        if (roll > tabla[tabla.length - 1].max) return tabla[tabla.length - 1].texto;
        const fila = tabla.find(row => roll >= row.min && roll <= row.max);
        return fila ? fila.texto : '';
    }

    const handleCritCheck = () => {
        const critTable = critTables.find(c => c.value === critType);
        const tablaCritico = critTable ? tablasCriticos[sistema][critTable.value as keyof typeof tablasCriticos[typeof sistema]] : undefined;
        if (tablaCritico) setCritResult(lookupCrit(tablaCritico, critRoll));
        else setCritResult('');
    };

    return (
        <HStack align="start" gap={8}>
            <Box p={4} borderWidth="1px" borderRadius="lg" minW="350px">
                <VStack gap={4}>
                    <Text fontSize="xl">Calculadora de Combate Rolemaster</Text>
                    <FormControl>
                        <FormLabel>Sistema</FormLabel>
                        <Select value={sistema} onChange={e => setSistema(e.target.value as 'rolemaster' | 'merp')}>
                            <option value="rolemaster">Rolemaster</option>
                            <option value="merp">MERP</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Tipo de ataque</FormLabel>
                        <Select
                            value={attackType}
                            onChange={e => {
                                const value = e.target.value as 'arma' | 'sortilegio';
                                setAttackType(value);
                                setSubType(value === 'arma' ? weaponTypes[0].value : spellTypes[0].value);
                            }}
                        >
                            <option value="arma">Arma</option>
                            <option value="sortilegio">Sortilegio</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>{attackType === 'arma' ? 'Tipo de arma' : 'Tipo de sortilegio'}</FormLabel>
                        <Select
                            value={subType}
                            onChange={e => setSubType(e.target.value)}
                        >
                            {attackType === 'arma'
                                ? weaponTypes.map(w => <option key={w.value} value={w.value}>{w.label}</option>)
                                : spellTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Tipo de armadura del objetivo</FormLabel>
                        <Select
                            value={armorType}
                            onChange={e => setArmorType(e.target.value)}
                        >
                            {armorTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Tirada de ataque (1d100)</FormLabel>
                      <Input
                          type="number"
                          value={attackRoll}
                          onChange={(e) => setAttackRoll(Number(e.target.value))}
                          placeholder="Tirada de ataque (1d100)"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Bonificación Ofensiva (OB)</FormLabel>
                      <Input
                          type="number"
                          value={offensiveBonus}
                          onChange={(e) => setOffensiveBonus(Number(e.target.value))}
                          placeholder="Bonificación Ofensiva (OB)"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Bonificación Defensiva (DB)</FormLabel>
                      <Input
                          type="number"
                          value={defensiveBonus}
                          onChange={(e) => setDefensiveBonus(Number(e.target.value))}
                          placeholder="Bonificación Defensiva (DB)"
                      />
                    </FormControl>
                    <Button colorScheme="blue" onClick={calculateAttack}>
                        Calcular Ataque
                    </Button>
                    {result && (
                        <VStack gap={2} align="start" w="100%">
                            <Text>Tirada: {result.roll}</Text>
                            <Text>Ataque Total: {result.totalAttack}</Text>
                            <Text>Resultado Neto: {result.netResult}</Text>
                            <Text>Armadura objetivo: {armorTypes.find(a => a.value === result.armorType)?.label}</Text>
                            {result.criticalType === 'PIFIA' && <Text color="red.600" fontWeight="bold">¡PIFIA!</Text>}
                            {result.criticalType === '-' && <Text color="gray.500">Sin efecto</Text>}
                            {result.damage > 0 && <Text color="red.600" fontWeight="bold">Puntos de vida perdidos: {result.damage}</Text>}
                            {result.criticalType && typeof result.criticalType === 'string' && ['A','B','C','D','E'].includes(result.criticalType) && (
                                <Text color="orange.500">Crítico: {result.criticalType}</Text>
                            )}
                            {result.simulatedMessage && (
                                <Text color="blue.600" fontWeight="bold">{result.simulatedMessage}</Text>
                            )}
                        </VStack>
                    )}
                    <Box w="100%" p={4} borderWidth="1px" borderRadius="md" bg="yellow.50">
                        <Text fontWeight="bold" mb={2}>Consulta de Crítico</Text>
                        <HStack gap={2}>
                            <FormControl w="120px">
                                <FormLabel>Tirada</FormLabel>
                                <Input type="number" value={critRoll} onChange={e => setCritRoll(Number(e.target.value))} />
                            </FormControl>
                            <FormControl w="180px">
                                <FormLabel>Tipo</FormLabel>
                                <Select value={critType} onChange={e => setCritType(e.target.value as string)}>
                                    {critTables.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button colorScheme="yellow" onClick={handleCritCheck}>Buscar</Button>
                        </HStack>
                        {critResult && (
                            <Box mt={3} p={3} bg="yellow.100" borderRadius="md">
                                <Text>{critResult}</Text>
                            </Box>
                        )}
                    </Box>
                </VStack>
            </Box>
            <Box p={4} borderWidth="1px" borderRadius="lg" minW="250px" bg="gray.50">
                <VStack gap={4}>
                    <Text fontSize="lg" fontWeight="bold">Simulador de Dados</Text>
                    <FormControl>
                        <FormLabel>Tipo de dado</FormLabel>
                        <Select value={diceType} onChange={e => setDiceType(e.target.value)}>
                            <option value="d4">d4</option>
                            <option value="d6">d6</option>
                            <option value="d8">d8</option>
                            <option value="d10">d10</option>
                            <option value="d12">d12</option>
                            <option value="d20">d20</option>
                            <option value="d100">d100</option>
                        </Select>
                    </FormControl>
                    <Button colorScheme="purple" onClick={handleDiceRoll}>A darle</Button>
                    {diceResult !== null && (
                        <Text fontSize="4xl" color="purple.600" fontWeight="bold" bg="purple.100" px={6} py={2} borderRadius="md">
                            {diceResult}
                        </Text>
                    )}
                </VStack>
            </Box>
        </HStack>
    );
}; 