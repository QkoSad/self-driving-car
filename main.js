const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 0;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 5);
const N = 200;
const cars = generateCars(N);
const traffic = [];
let minY = 500;
let carsCount = 3;
for (let i = 0; i < carsCount; i++) {
	traffic.push(
		new Car(
			road.getLaneCenter(Math.random() * 5),
			Math.random() * (-1300 + 700) - 700,
			"DUMMY",
			getRandomColor(),
			Math.random() * 2.9
		)
	);
}
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
	for (let i = 0; i < cars.length; i++) {
		cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
		if (i != 0) {
			NeuralNetwork.mutate(cars[i].brain, 0.2);
		}
	}
}
animate();

function save() {
	localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
	localStorage.setItem("bestScore", JSON.stringify(bestCar.y));
}
function discard() {
	localStorage.removeItem("bestBrain");
	localStorage.removeItem("bestScore");
}
function generateCars(N) {
	const cars = [];
	for (let i = 0; i <= N; i++) {
		cars.push(new Car(road.getLaneCenter(1), -1, "AI"));
	}
	return cars;
}
setInterval(() => {
	if (carsCount < 15) {
		traffic.push(
			new Car(
				road.getLaneCenter(Math.random() * 3),
				bestCar.y - 800,
				"DUMMY",
				getRandomColor(),
				Math.random() * 2.9
			)
		);
		carsCount += 1;
	}
	if (bestCar.y < localStorage.getItem("bestScore")) save();
	if (minY > 0) minY = -minY;
	minY = minY * 1.5;
}, 5000);
function animate() {
	for (let i = 0; i < traffic.length; i++) {
		if (
			traffic[i].y > bestCar.y + 350 ||
			traffic[i].y < bestCar.y - 1400
		) {
			traffic.splice(
				i,
				1,
				new Car(
					road.getLaneCenter(Math.random() * 3),
					bestCar.y - 800,
					"DUMMY",
					getRandomColor(),
					Math.random() * 2.9
				)
			);
		}
		traffic[i].update(road.borders, []);
	}
	let restart = true;
	for (let i = 0; i < cars.length; i++) {
		cars[i].update(road.borders, traffic);
		restart = restart && cars[i].damaged;
		if (minY < cars[i].y) cars[i].damaged = true;
	}
	if (restart) location.reload();
	bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));
	carCanvas.height = window.innerHeight;
	networkCanvas.height = window.innerHeight;

	carCtx.save();
	carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
	road.draw(carCtx);
	for (let i = 0; i < traffic.length; i++) {
		traffic[i].draw(carCtx, "red");
	}
	carCtx.globalAlpha = 0.2;
	for (let i = 0; i < cars.length; i++) {
		cars[i].draw(carCtx, "blue");
	}
	carCtx.globalAlpha = 1;
	bestCar.draw(carCtx, "blue", true);
	carCtx.restore();
	//	Visualizer.drawNetwork(networkCtx, bestCar.brain);
	requestAnimationFrame(animate);
}
