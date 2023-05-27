document.getElementById('generate-button').addEventListener('click', generateWorkoutPlan);

function fetchExerciseList() {
    return fetch('https://wger.de/api/v2/exercise/?language=2&status=2')
        .then(response => response.json())
        .then(data => data.results)
        .catch(error => console.error('Error:', error));
}

function generateWorkoutPlan() {
    fetchExerciseList()
        .then(exercises => {
            const workoutPlanTable = document.getElementById('workout-plan');
            const newRow = document.createElement('tr');
            for (let i = 0; i < 7; i++) {
                const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
                const exerciseCell = document.createElement('td');
                exerciseCell.textContent = randomExercise.name;
                newRow.appendChild(exerciseCell);
            }
            // Clean up the old row if it exists
            if (workoutPlanTable.rows.length > 1) {
                workoutPlanTable.deleteRow(1);
            }
            workoutPlanTable.appendChild(newRow);
        });
}
