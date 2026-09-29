
export interface WordEntry {
    category: string;
    word: string;
}

export const CATEGORIES: Record<string, string[]> = {
    'Food & Drinks': [
        'Pizza', 'Burger', 'Sushi', 'Ice Cream', 'Taco', 'Donut',
        'Pancake', 'PopCorn', 'DoraCake', 'Banana', 'Coffee'
    ],
    'Animals': [
        'Elephant', 'Giraffe', 'Penguin', 'Cat', 'Dog', 'Kangaroo', 'Shark', 'Octopus', 'Lion', 'Butterfly'
    ],
    'Everyday Objects': [
        'Chair', 'Guitar', 'Clock', 'Bicycle', 'Headphones', 'Umbrella', 'Scissors', 'Backpack', 'Toothbrush', 'Camera'
    ],
    'Places & Landmarks': [
        'Eiffel Tower', 'Pyramids', 'Statue of Liberty', 'Hospital', 'Airport', 'Beach', 'Castle', 'Cinema'
    ],
    'Vehicles': [
        'Helicopter', 'Submarine', 'Rocket', 'Skateboard', 'Ambulance', 'Tractor', 'Motorcycle', 'Hot Air Balloon'
    ],
    'Clothing & Fashion': [
        'Sunglasses', 'Crown', 'High Heels', 'Tie', 'Hoodie', 'Sneakers', 'Scarf', 'Watch'
    ]
};

export class WordManager {
    public static getCategories(): string[] {
        return Object.keys(CATEGORIES);
    }

    public static getRandomWord(): WordEntry {
        const categories = Object.keys(CATEGORIES);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const words = CATEGORIES[randomCategory];
        const randomWord = words[Math.floor(Math.random() * words.length)];

        return {
            category: randomCategory,
            word: randomWord,
        }
    }

    public static getRandomWordFromCategory(category: string): WordEntry {
        const words =   CATEGORIES[category] || CATEGORIES['Everyday Objects'];
        const randomWord = words[Math.floor(Math.random() * words.length)];

        return{
            category,
            word: randomWord,
        }
    }

    public static isGuessCorrect(guess: string, secretWord: string): boolean {
        const cleanGuess = guess.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        const cleanSecret = secretWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

        return cleanGuess === cleanSecret;
    }
}