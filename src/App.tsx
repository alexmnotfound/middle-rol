import React, { useState } from 'react';
import { ChakraProvider, Container, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { CombatCalculator } from './components/CombatCalculator';
import { CharacterSheet } from './components/CharacterSheet';
import { Character } from './types';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);

  const handleSaveCharacter = (character: Character) => {
    if (character.id) {
      setCharacters(characters.map(c => c.id === character.id ? character : c));
    } else {
      setCharacters([...characters, { ...character, id: Date.now().toString() }]);
    }
  };

  return (
    <ChakraProvider>
      <Container maxW="container.lg" py={8}>
        <VStack gap={8}>
          <Tabs isFitted variant="enclosed" width="100%">
            <TabList mb="1em">
              <Tab>Calculadora de Combate</Tab>
              <Tab>Personajes</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <CombatCalculator />
              </TabPanel>
              <TabPanel>
                <VStack gap={4}>
                  <CharacterSheet
                    character={{
                      id: '',
                      name: '',
                      offensiveBonus: 0,
                      defensiveBonus: 0,
                      otherModifiers: 0,
                      weaponType: 'sword'
                    }}
                    onSave={handleSaveCharacter}
                  />
                  {characters.map(character => (
                    <CharacterSheet
                      key={character.id}
                      character={character}
                      onSave={handleSaveCharacter}
                    />
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </ChakraProvider>
  );
};

export default App; 