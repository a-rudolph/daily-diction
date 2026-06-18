export interface SeedMenuItem {
  category: string;
  name: string;
  description?: string;
  price?: string;
  sortOrder: number;
}

export interface SeedMenu {
  slug: string;
  name: string;
  cuisine: string;
  sortOrder: number;
  items: SeedMenuItem[];
}

// ─── Italian ─────────────────────────────────────────────────────────────────

const italian: SeedMenu = {
  slug: 'italian',
  name: 'Trattoria',
  cuisine: 'Italian',
  sortOrder: 1,
  items: [
    // Starters
    { category: 'Starters', name: 'Bruschetta al pomodoro', description: 'Grilled bread, tomato, basil, olive oil', price: '9', sortOrder: 1 },
    { category: 'Starters', name: 'Carpaccio di manzo', description: 'Thin-sliced beef, rocket, Parmesan, capers', price: '14', sortOrder: 2 },
    { category: 'Starters', name: 'Burrata con prosciutto', description: 'Fresh burrata, cured ham, cherry tomatoes', price: '16', sortOrder: 3 },
    { category: 'Starters', name: 'Arancini', description: 'Fried risotto balls, mozzarella, marinara', price: '11', sortOrder: 4 },
    { category: 'Starters', name: 'Caesar salad', description: 'Romaine, Parmesan, anchovy dressing, croutons', price: '12', sortOrder: 5 },

    // Pasta
    { category: 'Pasta', name: 'Spaghetti carbonara', description: 'Guanciale, egg yolk, Pecorino Romano, black pepper', price: '18', sortOrder: 1 },
    { category: 'Pasta', name: 'Pappardelle al ragù', description: 'Slow-braised beef and pork, wide ribbons', price: '22', sortOrder: 2 },
    { category: 'Pasta', name: 'Cacio e pepe', description: 'Tonnarelli, Pecorino, black pepper — nothing else', price: '17', sortOrder: 3 },
    { category: 'Pasta', name: 'Tortellini in brodo', description: 'Meat-stuffed pasta in capon broth', price: '19', sortOrder: 4 },
    { category: 'Pasta', name: 'Spaghetti aglio e olio', description: 'Garlic, chilli, parsley, good olive oil', price: '15', sortOrder: 5 },
    { category: 'Pasta', name: 'Rigatoni all\'amatriciana', description: 'Guanciale, San Marzano tomato, Pecorino', price: '18', sortOrder: 6 },

    // Mains
    { category: 'Mains', name: 'Osso buco alla Milanese', description: 'Braised veal shank, gremolata, saffron risotto', price: '34', sortOrder: 1 },
    { category: 'Mains', name: 'Branzino al cartoccio', description: 'Sea bass baked in parchment, capers, olives, lemon', price: '31', sortOrder: 2 },
    { category: 'Mains', name: 'Pollo alla cacciatore', description: 'Hunter-style chicken, rosemary, white wine, tomatoes', price: '26', sortOrder: 3 },
    { category: 'Mains', name: 'Eggplant parmigiana', description: 'Layered aubergine, tomato sauce, mozzarella, basil', price: '22', sortOrder: 4 },

    // Desserts
    { category: 'Desserts', name: 'Tiramisu', description: 'Espresso-soaked ladyfingers, mascarpone, cocoa', price: '10', sortOrder: 1 },
    { category: 'Desserts', name: 'Panna cotta', description: 'Vanilla cream, seasonal berry coulis', price: '9', sortOrder: 2 },
    { category: 'Desserts', name: 'Cannoli siciliani', description: 'Fried pastry shells, ricotta, pistachios', price: '9', sortOrder: 3 },
    { category: 'Desserts', name: 'Affogato', description: 'Vanilla gelato drowned in a double espresso', price: '8', sortOrder: 4 },

    // Drinks
    { category: 'Drinks', name: 'Aperol spritz', description: 'Aperol, Prosecco, soda, orange slice', price: '13', sortOrder: 1 },
    { category: 'Drinks', name: 'Negroni', description: 'Campari, sweet vermouth, gin', price: '14', sortOrder: 2 },
    { category: 'Drinks', name: 'Sparkling water', price: '4', sortOrder: 3 },
    { category: 'Drinks', name: 'House red', description: 'Montepulciano d\'Abruzzo', price: '10', sortOrder: 4 },
  ],
};

// ─── Japanese / Sushi ────────────────────────────────────────────────────────

const japanese: SeedMenu = {
  slug: 'japanese',
  name: 'Izakaya',
  cuisine: 'Japanese',
  sortOrder: 2,
  items: [
    // Starters
    { category: 'Starters', name: 'Edamame', description: 'Salted steamed soybeans', price: '6', sortOrder: 1 },
    { category: 'Starters', name: 'Gyoza', description: 'Pan-fried pork and cabbage dumplings, ponzu', price: '10', sortOrder: 2 },
    { category: 'Starters', name: 'Karaage', description: 'Japanese fried chicken, kewpie mayo, lemon', price: '12', sortOrder: 3 },
    { category: 'Starters', name: 'Agedashi tofu', description: 'Silken tofu in dashi broth, bonito flakes, ginger', price: '11', sortOrder: 4 },
    { category: 'Starters', name: 'Takoyaki', description: 'Octopus balls, okonomiyaki sauce, bonito', price: '10', sortOrder: 5 },

    // Sushi & Sashimi
    { category: 'Sushi & Sashimi', name: 'Salmon nigiri', price: '5', sortOrder: 1 },
    { category: 'Sushi & Sashimi', name: 'Yellowtail sashimi', description: 'Sliced hamachi, ponzu, jalapeño', price: '16', sortOrder: 2 },
    { category: 'Sushi & Sashimi', name: 'Spicy tuna roll', description: 'Tuna, sriracha mayo, cucumber, sesame', price: '14', sortOrder: 3 },
    { category: 'Sushi & Sashimi', name: 'Dragon roll', description: 'Shrimp tempura topped with avocado and tobiko', price: '17', sortOrder: 4 },
    { category: 'Sushi & Sashimi', name: 'Chirashi', description: 'Assorted sashimi over seasoned rice', price: '28', sortOrder: 5 },

    // Mains
    { category: 'Mains', name: 'Tonkotsu ramen', description: 'Rich pork bone broth, chashu, soft egg, nori', price: '19', sortOrder: 1 },
    { category: 'Mains', name: 'Chicken katsu curry', description: 'Panko-fried chicken, Japanese curry, steamed rice', price: '20', sortOrder: 2 },
    { category: 'Mains', name: 'Yakitori set', description: 'Grilled skewers: thigh, tsukune, asparagus, shishito', price: '22', sortOrder: 3 },
    { category: 'Mains', name: 'Ebi tempura', description: 'Crispy prawn tempura, tentsuyu dipping sauce, rice', price: '23', sortOrder: 4 },

    // Desserts
    { category: 'Desserts', name: 'Mochi ice cream', description: 'Three pieces — matcha, mango, strawberry', price: '8', sortOrder: 1 },
    { category: 'Desserts', name: 'Matcha cheesecake', price: '9', sortOrder: 2 },

    // Drinks
    { category: 'Drinks', name: 'Sapporo draft', price: '8', sortOrder: 1 },
    { category: 'Drinks', name: 'Yuzu sake', description: 'Chilled, 180ml', price: '12', sortOrder: 2 },
    { category: 'Drinks', name: 'Ramune', description: 'Japanese soda with marble top', price: '5', sortOrder: 3 },
    { category: 'Drinks', name: 'Hojicha', description: 'Roasted green tea, served hot or iced', price: '5', sortOrder: 4 },
  ],
};

// ─── French Bistro ───────────────────────────────────────────────────────────

const french: SeedMenu = {
  slug: 'french',
  name: 'Bistro',
  cuisine: 'French',
  sortOrder: 3,
  items: [
    // Starters
    { category: 'Starters', name: 'French onion soup', description: 'Caramelised onion broth, Gruyère croûton', price: '13', sortOrder: 1 },
    { category: 'Starters', name: 'Escargots de Bourgogne', description: 'Snails in garlic-parsley butter', price: '15', sortOrder: 2 },
    { category: 'Starters', name: 'Pâté de campagne', description: 'Country terrine, cornichons, mustard, toasted baguette', price: '14', sortOrder: 3 },
    { category: 'Starters', name: 'Salade niçoise', description: 'Tuna, olives, haricots verts, hard-boiled egg, anchovy', price: '16', sortOrder: 4 },
    { category: 'Starters', name: 'Leek vinaigrette', description: 'Braised leeks, Dijon dressing, soft egg', price: '12', sortOrder: 5 },

    // Mains
    { category: 'Mains', name: 'Steak frites', description: 'Entrecôte, herb butter, hand-cut fries', price: '34', sortOrder: 1 },
    { category: 'Mains', name: 'Bouillabaisse', description: 'Provençal fish stew, rouille, baguette', price: '36', sortOrder: 2 },
    { category: 'Mains', name: 'Coq au vin', description: 'Braised chicken, red wine, lardons, mushrooms', price: '28', sortOrder: 3 },
    { category: 'Mains', name: 'Croque-monsieur', description: 'Ham and Gruyère on toasted brioche, béchamel', price: '18', sortOrder: 4 },
    { category: 'Mains', name: 'Sole meunière', description: 'Dover sole, lemon butter, capers, parsley', price: '38', sortOrder: 5 },
    { category: 'Mains', name: 'Ratatouille', description: 'Provençal vegetable stew, herbes de Provence', price: '20', sortOrder: 6 },

    // Desserts
    { category: 'Desserts', name: 'Crème brûlée', description: 'Vanilla custard, caramelised sugar crust', price: '10', sortOrder: 1 },
    { category: 'Desserts', name: 'Tarte tatin', description: 'Upside-down apple tart, crème fraîche', price: '11', sortOrder: 2 },
    { category: 'Desserts', name: 'Profiteroles', description: 'Choux pastry, vanilla cream, warm chocolate sauce', price: '10', sortOrder: 3 },
    { category: 'Desserts', name: 'Île flottante', description: 'Meringue floating on crème anglaise, caramel', price: '9', sortOrder: 4 },

    // Drinks
    { category: 'Drinks', name: 'Kir royale', description: 'Crème de cassis, Champagne', price: '14', sortOrder: 1 },
    { category: 'Drinks', name: 'Pastis', description: 'Ricard, water, ice', price: '10', sortOrder: 2 },
    { category: 'Drinks', name: 'Carafe de vin rouge', description: '250ml, Côtes du Rhône', price: '14', sortOrder: 3 },
  ],
};

// ─── Vietnamese ──────────────────────────────────────────────────────────────

const vietnamese: SeedMenu = {
  slug: 'vietnamese',
  name: 'Phở & Co.',
  cuisine: 'Vietnamese',
  sortOrder: 4,
  items: [
    // Starters
    { category: 'Starters', name: 'Gỏi cuốn', description: 'Fresh spring rolls: shrimp, pork, rice noodle, hoisin peanut', price: '9', sortOrder: 1 },
    { category: 'Starters', name: 'Chả giò', description: 'Crispy imperial rolls, nuoc cham', price: '10', sortOrder: 2 },
    { category: 'Starters', name: 'Bánh mì', description: 'Baguette, five-spice pork, pâté, pickled daikon, coriander', price: '13', sortOrder: 3 },
    { category: 'Starters', name: 'Bún bò Huế soup', description: 'Spicy lemongrass beef broth, thick noodles', price: '14', sortOrder: 4 },

    // Phở
    { category: 'Phở', name: 'Phở bò tái', description: 'Rare beef slices, rice noodles, beef broth, herbs', price: '16', sortOrder: 1 },
    { category: 'Phở', name: 'Phở gà', description: 'Chicken phở, clear broth, bean sprouts, basil, lime', price: '15', sortOrder: 2 },
    { category: 'Phở', name: 'Phở chay', description: 'Vegetarian phở, mushroom broth, tofu', price: '14', sortOrder: 3 },

    // Mains
    { category: 'Mains', name: 'Bún chả', description: 'Grilled pork patties, rice vermicelli, herbs, dipping sauce', price: '18', sortOrder: 1 },
    { category: 'Mains', name: 'Cơm tấm', description: 'Broken rice, grilled pork chop, pickled veg, fried egg', price: '17', sortOrder: 2 },
    { category: 'Mains', name: 'Cà ri gà', description: 'Vietnamese chicken curry, coconut milk, sweet potato, baguette', price: '19', sortOrder: 3 },
    { category: 'Mains', name: 'Hủ tiếu', description: 'Clear pork noodle soup, shrimp, quail eggs', price: '16', sortOrder: 4 },

    // Desserts
    { category: 'Desserts', name: 'Chè ba màu', description: 'Three-colour dessert: mung bean, red bean, pandan jelly, coconut milk', price: '7', sortOrder: 1 },
    { category: 'Desserts', name: 'Bánh flan', description: 'Vietnamese crème caramel', price: '6', sortOrder: 2 },

    // Drinks
    { category: 'Drinks', name: 'Cà phê sữa đá', description: 'Vietnamese iced coffee with condensed milk', price: '5', sortOrder: 1 },
    { category: 'Drinks', name: 'Sinh tố bơ', description: 'Avocado smoothie, condensed milk', price: '7', sortOrder: 2 },
    { category: 'Drinks', name: 'Trà đào', description: 'Peach iced tea', price: '5', sortOrder: 3 },
    { category: 'Drinks', name: 'Bia Saigon', price: '6', sortOrder: 4 },
  ],
};

// ─── Coffee Shop ─────────────────────────────────────────────────────────────

const coffee: SeedMenu = {
  slug: 'coffee',
  name: 'The Corner Café',
  cuisine: 'Coffee Shop',
  sortOrder: 5,
  items: [
    // Espresso
    { category: 'Espresso Drinks', name: 'Espresso', price: '3.50', sortOrder: 1 },
    { category: 'Espresso Drinks', name: 'Cappuccino', description: 'Double shot, steamed milk, thick microfoam', price: '4.50', sortOrder: 2 },
    { category: 'Espresso Drinks', name: 'Cortado', description: 'Equal parts espresso and warm milk', price: '4', sortOrder: 3 },
    { category: 'Espresso Drinks', name: 'Flat white', price: '4.50', sortOrder: 4 },
    { category: 'Espresso Drinks', name: 'Oat milk latte', price: '5.50', sortOrder: 5 },
    { category: 'Espresso Drinks', name: 'Affogato', description: 'Vanilla ice cream, double espresso', price: '6', sortOrder: 6 },

    // Cold
    { category: 'Cold Drinks', name: 'Cold brew', description: 'Steeped 18 hours, served over ice', price: '5', sortOrder: 1 },
    { category: 'Cold Drinks', name: 'Iced matcha latte', description: 'Ceremonial grade, oat milk', price: '6', sortOrder: 2 },
    { category: 'Cold Drinks', name: 'Sparkling water', price: '3', sortOrder: 3 },

    // Food
    { category: 'Food', name: 'Almond croissant', description: 'Filled with frangipane, toasted almonds', price: '5', sortOrder: 1 },
    { category: 'Food', name: 'Avocado toast', description: 'Sourdough, smashed avo, chilli flakes, poached egg', price: '13', sortOrder: 2 },
    { category: 'Food', name: 'Granola bowl', description: 'House granola, Greek yoghurt, seasonal fruit', price: '10', sortOrder: 3 },
    { category: 'Food', name: 'Pain au chocolat', price: '4', sortOrder: 4 },
    { category: 'Food', name: 'Cinnamon scroll', description: 'Soft-baked, cream cheese glaze', price: '5', sortOrder: 5 },
    { category: 'Food', name: 'Ham and Gruyère quiche', price: '9', sortOrder: 6 },
  ],
};

// ─── Brunch / Diner ──────────────────────────────────────────────────────────

const brunch: SeedMenu = {
  slug: 'brunch',
  name: 'Sunday Diner',
  cuisine: 'Brunch',
  sortOrder: 6,
  items: [
    // All-day breakfast
    { category: 'All-Day Breakfast', name: 'Full English', description: 'Eggs, bacon, sausage, black pudding, baked beans, toast', price: '16', sortOrder: 1 },
    { category: 'All-Day Breakfast', name: 'Eggs Benedict', description: 'Poached eggs, Canadian bacon, hollandaise on English muffin', price: '14', sortOrder: 2 },
    { category: 'All-Day Breakfast', name: 'Shakshuka', description: 'Eggs poached in spiced tomato and pepper sauce, sourdough', price: '13', sortOrder: 3 },
    { category: 'All-Day Breakfast', name: 'Buttermilk pancakes', description: 'Stack of three, maple syrup, whipped butter', price: '12', sortOrder: 4 },
    { category: 'All-Day Breakfast', name: 'Smoked salmon bagel', description: 'Cream cheese, capers, red onion, dill', price: '15', sortOrder: 5 },

    // Mains
    { category: 'Mains', name: 'Chicken and waffles', description: 'Fried chicken thigh, Belgian waffle, hot honey butter', price: '18', sortOrder: 1 },
    { category: 'Mains', name: 'Croque-madame', description: 'Ham, Gruyère, béchamel, fried egg on brioche', price: '16', sortOrder: 2 },
    { category: 'Mains', name: 'House burger', description: 'Beef patty, cheddar, pickles, smashed sauce, brioche bun', price: '17', sortOrder: 3 },
    { category: 'Mains', name: 'Caesar salad', description: 'Romaine, Parmesan, anchovy dressing, croutons', price: '13', sortOrder: 4 },

    // Sides
    { category: 'Sides', name: 'House fries', price: '5', sortOrder: 1 },
    { category: 'Sides', name: 'Hash browns', description: 'Crispy shredded potato cakes, sour cream', price: '6', sortOrder: 2 },
    { category: 'Sides', name: 'Extra bacon', price: '4', sortOrder: 3 },

    // Drinks
    { category: 'Drinks', name: 'Bloody Mary', description: 'Vodka, tomato juice, celery, Tabasco, Worcestershire', price: '13', sortOrder: 1 },
    { category: 'Drinks', name: 'Mimosa', description: 'Champagne, fresh-squeezed orange juice', price: '11', sortOrder: 2 },
    { category: 'Drinks', name: 'Freshly squeezed orange juice', price: '6', sortOrder: 3 },
    { category: 'Drinks', name: 'Drip coffee', description: 'Free refills', price: '4', sortOrder: 4 },
  ],
};

// ─── Mexican / Taco ──────────────────────────────────────────────────────────

const mexican: SeedMenu = {
  slug: 'mexican',
  name: 'Cantina',
  cuisine: 'Mexican',
  sortOrder: 7,
  items: [
    // Starters
    { category: 'Starters', name: 'Guacamole', description: 'Avocado, lime, serrano, cilantro, tortilla chips', price: '10', sortOrder: 1 },
    { category: 'Starters', name: 'Queso fundido', description: 'Melted Oaxaca cheese, chorizo, flour tortillas', price: '12', sortOrder: 2 },
    { category: 'Starters', name: 'Esquites', description: 'Street corn off the cob, mayo, cotija, chilli lime', price: '9', sortOrder: 3 },
    { category: 'Starters', name: 'Ceviche de camarón', description: 'Shrimp, lime juice, tomato, jalapeño, avocado, tostadas', price: '14', sortOrder: 4 },

    // Tacos (2 per order)
    { category: 'Tacos', name: 'Tacos al pastor', description: 'Pork marinated in guajillo and achiote, pineapple, onion, cilantro', price: '13', sortOrder: 1 },
    { category: 'Tacos', name: 'Tacos de carnitas', description: 'Slow-braised pork, pickled red onion, salsa verde', price: '13', sortOrder: 2 },
    { category: 'Tacos', name: 'Tacos de barbacoa', description: 'Beef cheek, consommé, onion, cilantro, salsa roja', price: '14', sortOrder: 3 },
    { category: 'Tacos', name: 'Tacos de pescado', description: 'Beer-battered fish, cabbage slaw, crema, chipotle', price: '14', sortOrder: 4 },

    // Mains
    { category: 'Mains', name: 'Enchiladas verdes', description: 'Chicken, tomatillo salsa, crema, cotija, rice and beans', price: '19', sortOrder: 1 },
    { category: 'Mains', name: 'Chiles rellenos', description: 'Poblano stuffed with cheese, tomato sauce, crema', price: '18', sortOrder: 2 },
    { category: 'Mains', name: 'Pozole rojo', description: 'Hominy pork stew, dried chillies, toppings', price: '17', sortOrder: 3 },
    { category: 'Mains', name: 'Burrito de pollo', description: 'Grilled chicken, rice, black beans, cheese, pico, crema', price: '16', sortOrder: 4 },

    // Desserts
    { category: 'Desserts', name: 'Churros', description: 'Fried dough sticks, cinnamon sugar, chocolate dipping sauce', price: '9', sortOrder: 1 },
    { category: 'Desserts', name: 'Tres leches', description: 'Sponge soaked in three milks, whipped cream', price: '9', sortOrder: 2 },

    // Drinks
    { category: 'Drinks', name: 'Margarita clásica', description: 'Blanco tequila, lime, Cointreau, salt rim', price: '14', sortOrder: 1 },
    { category: 'Drinks', name: 'Paloma', description: 'Tequila, grapefruit soda, lime, salt', price: '13', sortOrder: 2 },
    { category: 'Drinks', name: 'Horchata', description: 'Rice milk, cinnamon, vanilla', price: '5', sortOrder: 3 },
    { category: 'Drinks', name: 'Agua de Jamaica', description: 'Hibiscus flower iced tea', price: '5', sortOrder: 4 },
  ],
};

// ─── Cocktail Bar ─────────────────────────────────────────────────────────────

const cocktailBar: SeedMenu = {
  slug: 'cocktail-bar',
  name: 'The Apothecary',
  cuisine: 'Cocktail Bar',
  sortOrder: 8,
  items: [
    // Classics
    { category: 'Classics', name: 'Negroni', description: 'Gin, Campari, sweet vermouth, orange', price: '14', sortOrder: 1 },
    { category: 'Classics', name: 'Old fashioned', description: 'Bourbon, demerara, Angostura bitters, orange peel', price: '15', sortOrder: 2 },
    { category: 'Classics', name: 'Aperol spritz', description: 'Aperol, Prosecco, soda, orange slice', price: '12', sortOrder: 3 },
    { category: 'Classics', name: 'Margarita', description: 'Blanco tequila, lime, Cointreau, salt rim', price: '14', sortOrder: 4 },
    { category: 'Classics', name: 'Espresso martini', description: 'Vodka, Kahlúa, double espresso, coffee foam', price: '15', sortOrder: 5 },
    { category: 'Classics', name: 'Whisky sour', description: 'Bourbon, lemon juice, simple syrup, egg white foam', price: '14', sortOrder: 6 },

    // Signatures
    { category: 'Signatures', name: 'The Apothecary Sour', description: 'Mezcal, yuzu, honey, rosemary smoke', price: '17', sortOrder: 1 },
    { category: 'Signatures', name: 'Penicillin', description: 'Blended Scotch, lemon, honey-ginger, Islay float', price: '17', sortOrder: 2 },
    { category: 'Signatures', name: 'Clover Club', description: 'Gin, raspberry, lemon, egg white', price: '15', sortOrder: 3 },
    { category: 'Signatures', name: 'Paper Plane', description: 'Bourbon, Aperol, Amaro Nonino, lemon — equal parts', price: '16', sortOrder: 4 },

    // Non-Alcoholic
    { category: 'Non-Alcoholic', name: 'Seedlip Spice 94 & tonic', price: '10', sortOrder: 1 },
    { category: 'Non-Alcoholic', name: 'Virgin Mary', description: 'Tomato juice, horseradish, Tabasco, Worcestershire, celery', price: '9', sortOrder: 2 },
    { category: 'Non-Alcoholic', name: 'Sparkling water', price: '4', sortOrder: 3 },

    // Snacks
    { category: 'Snacks', name: 'Charcuterie board', description: 'Cured meats, pickles, mustard, crostini', price: '18', sortOrder: 1 },
    { category: 'Snacks', name: 'Marinated olives', price: '7', sortOrder: 2 },
    { category: 'Snacks', name: 'Truffle parmesan fries', price: '10', sortOrder: 3 },
    { category: 'Snacks', name: 'Burrata', description: 'Cherry tomatoes, basil oil, sea salt, grilled bread', price: '14', sortOrder: 4 },
  ],
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const seedMenus: SeedMenu[] = [
  italian,
  japanese,
  french,
  vietnamese,
  coffee,
  brunch,
  mexican,
  cocktailBar,
];
