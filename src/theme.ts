import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#c7b2ff',
      200: '#9e80ff',
      300: '#754dff',
      400: '#4c1aff',
      500: '#3300e6',
      600: '#2600b3',
      700: '#190080',
      800: '#0d004d',
      900: '#00001a',
    },
  },
  components: {
    Box: {
      baseStyle: {
        borderRadius: 'md',
        boxShadow: 'lg',
        bg: 'white',
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.400',
          color: 'white',
          _hover: {
            bg: 'brand.500',
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: 'brand.600',
              borderColor: 'brand.200',
            },
          },
        },
      },
    },
  },
  fonts: {
    heading: '"Cinzel", serif',
    body: '"Crimson Text", serif',
  },
});

export default theme; 