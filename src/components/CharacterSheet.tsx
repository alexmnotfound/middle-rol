import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Input,
    Button,
    Text,
    FormControl,
    FormLabel,
    Select
} from '@chakra-ui/react';
import { Character } from '../types';

interface CharacterSheetProps {
    character: Character;
    onSave: (character: Character) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onSave }) => {
    const [editedCharacter, setEditedCharacter] = useState<Character>(character);

    useEffect(() => {
        setEditedCharacter(character);
    }, [character]);

    const handleChange = (field: keyof Character, value: any) => {
        setEditedCharacter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedCharacter);
        // Limpiar solo si es un personaje nuevo
        if (!character.id) {
            setEditedCharacter({
                id: '',
                name: '',
                offensiveBonus: 0,
                defensiveBonus: 0,
                otherModifiers: 0,
                weaponType: 'sword'
            });
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="lg">
            <VStack gap={4}>
                <Text fontSize="xl">Hoja de Personaje</Text>
                <FormControl>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                      value={editedCharacter.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Nombre"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Bonificación Ofensiva (OB)</FormLabel>
                  <Input
                      type="number"
                      value={editedCharacter.offensiveBonus}
                      onChange={(e) => handleChange('offensiveBonus', Number(e.target.value))}
                      placeholder="Bonificación Ofensiva (OB)"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Bonificación Defensiva (DB)</FormLabel>
                  <Input
                      type="number"
                      value={editedCharacter.defensiveBonus}
                      onChange={(e) => handleChange('defensiveBonus', Number(e.target.value))}
                      placeholder="Bonificación Defensiva (DB)"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Otros Modificadores</FormLabel>
                  <Input
                      type="number"
                      value={editedCharacter.otherModifiers}
                      onChange={(e) => handleChange('otherModifiers', Number(e.target.value))}
                      placeholder="Otros Modificadores"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tipo de Arma</FormLabel>
                  <Select
                      value={editedCharacter.weaponType}
                      onChange={(e) => handleChange('weaponType', e.target.value)}
                  >
                    <option value="sword">Espada</option>
                    <option value="axe">Hacha</option>
                    <option value="bow">Arco</option>
                    <option value="spear">Lanza</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                <Button type="submit" colorScheme="blue">
                    {character.id ? 'Actualizar' : 'Crear'} Personaje
                </Button>
            </VStack>
        </Box>
    );
}; 