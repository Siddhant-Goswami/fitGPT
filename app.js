const API = {
    ID: "d274a2ad",
    KEY: "c2131569c6f44750cca1ba268df3de02",
    URL: "https://api.edamam.com/search?",
};

const form = document.getElementById('mealPlanForm');
const mealPlanResults = document.getElementById('mealPlanResults');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const mealCount = parseInt(document.getElementById('mealCount').value);
    const diet = document.getElementById('diet').value;
    const health = document.getElementById('health').value;
    const caloriesMin = parseInt(document.getElementById('caloriesMin').value);
    const caloriesMax = parseInt(document.getElementById('caloriesMax').value);

    if (!mealCount || !diet || !caloriesMin || !caloriesMax) {
        alert('Please fill in all the fields.');
        return;
    }

    const data = {
        plan: mealCount,
        meals: Array.from(Array(mealCount).keys()).map(i => `Meal ${i + 1}`),
        calories: { min: caloriesMin, max: caloriesMax },
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
            min: Math.round(calories.min / mealCount),
            max: Math.round(calories.max / mealCount),
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
