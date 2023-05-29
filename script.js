const API = {
    ID: "d274a2ad",
    KEY: "c2131569c6f44750cca1ba268df3de02",
    URL: "https://api.edamam.com/search?",
};

const calorieCalculatorForm = document.getElementById('calorieCalculatorForm');
const calorieResult = document.getElementById('calorieResult');
const mealPlanForm = document.getElementById('mealPlanForm');
const mealPlanResults = document.getElementById('mealPlanResults');

calorieCalculatorForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);
    const activityLevel = document.getElementById('activityLevel').value;

    if (!gender || !age || !height || !weight || !activityLevel) {
        alert('Please fill in all the fields.');
        return;
    }

    const calories = calculateCaloricNeeds(gender, age, height, weight, activityLevel);
    displayCalorieResult(calories);
});

const calculateCaloricNeeds = (gender, age, height, weight, activityLevel) => {
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    let activityFactor;
    switch (activityLevel) {
        case 'sedentary':
            activityFactor = 1.2;
            break;
        case 'lightlyActive':
            activityFactor = 1.375;
            break;
        case 'moderatelyActive':
            activityFactor = 1.55;
            break;
        case 'veryActive':
            activityFactor = 1.725;
            break;
        case 'superActive':
            activityFactor = 1.9;
            break;
        default:
            activityFactor = 1.2;
    }

    const calories = Math.round(bmr * activityFactor);
    return calories;
};

const displayCalorieResult = (calories) => {
    calorieResult.innerHTML = `
      <p>Your estimated daily caloric needs: <strong>${calories} calories</strong></p>
    `;

    const caloriesInput = document.getElementById('calories');
    caloriesInput.value = calories;
};

mealPlanForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const mealCount = parseInt(document.getElementById('mealCount').value);
    const diet = document.getElementById('diet').value;
    const health = document.getElementById('health').value;
    const calories = parseInt(document.getElementById('calories').value);

    if (!mealCount || !diet || !calories) {
        alert('Please fill in all the fields.');
        return;
    }

    const data = {
        plan: mealCount,
        meals: Array.from(Array(mealCount).keys()).map(i => `Meal ${i + 1}`),
        calories: calories,
        diet: diet,
        health: health
    };

    generateMealPlan(data);
});

const generateMealPlan = (data) => {
    const { ID, KEY, URL } = API;

    const getPlan = async (data) => {
        const { plan, meals, calories, diet, health } = data;

        if (!plan || !meals || !calories || !diet) {
            return false;
        }

        const mealCount = meals.length;
        const caloriesPerMeal = {
            min: Math.round(calories / mealCount) - 300,
            max: Math.round(calories / mealCount),
        };

        const promises = [];
        const result = {};

        for (let i = 0; i < mealCount; i++) {
            const meal = meals[i];
            const query = buildQuery(meal, plan, caloriesPerMeal, diet, health, ID, KEY);
            const requestUrl = URL + query;

            promises.push(
                fetch(requestUrl)
                    .then((response) => response.json())
                    .then((data) => {
                        result[meal] = data.hits;
                    })
                    .catch((error) => console.error(error))
            );
        }

        await Promise.all(promises);
        return result;
    };

    const buildQuery = (meal, plan, calories, diet, health, id, key) => {
        const encodedMeal = encodeURIComponent(meal);
        const query = `q=${encodedMeal}&app_id=${id}&app_key=${key}&to=${plan}&diet=${diet}&calories=${calories.min}-${calories.max}`;

        if (health) {
            const encodedHealth = encodeURIComponent(health);
            return `${query}&health=${encodedHealth}`;
        }

        return query;
    };

    getPlan(data)
        .then((mealPlan) => {
            displayMealPlan(mealPlan);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};

const displayMealPlan = (mealPlan) => {
    let mealPlanHtml = '';

    for (const meal in mealPlan) {
        const recipes = mealPlan[meal];
        const recipeHtml = recipes.map((recipe) => {
            const { label, image, ingredientLines } = recipe.recipe;
            const ingredients = ingredientLines.join('<br>');

            return `
          <div class="meal-recipe">
            <h3>${label}</h3>
            <img src="${image}" alt="${label}">
            <p><strong>Ingredients:</strong></p>
            <p>${ingredients}</p>
          </div>
        `;
        }).join('');

        mealPlanHtml += `
        <div class="meal">
          <h2>${meal}</h2>
          ${recipeHtml}
        </div>
      `;
    }

    mealPlanResults.innerHTML = mealPlanHtml;
};
