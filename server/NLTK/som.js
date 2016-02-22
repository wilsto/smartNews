// An implementation from self-organizing maps as adapted from the Node.js
// som plug-in. Replaces feature and feature vectors with _word_ vectors.
// Written specifically to work with the Twitter Recommendation Engine.

// Define the class representing the nodes on the self-organizing map.
var Node = function (config) {
	this.neighbors = {};

	this.weights = config.weights || [];
	this.label = config.label || 'down';
	this.index = config.index;
	this.x = config.x;
	this.y = config.y;
};

// Define the class representing the map itself.
// givenConfig takes in:
// -- distanceFunction
// -- initialRadius
// -- iterationCount
// -- initialLearningRate
// -- precision
// -- scale

var Som = function (givenConfig) {
	var config = givenConfig || {};

	// Use the default Euclidean distance measure given two word vectors.
	var euclideanDistance = function(vector1, vector2)
	{
		var distance = 0;
		
		for (var i = 0, length = vector1.length; i < length; i++) {
			var value1 = 0, value2 = 0;

			if (vector1[i] !== null && vector1[i] !== undefined) {
				value1 = vector1[i];
			}
			if (vector2[i] !== null && vector2[i] !== undefined) {
				value2 = vector2[i];
			}
			
			distance += Math.pow((value1 - value2), 2);
		}

		if (vector2.length > vector1.length) {
			for (var i = vector1.length, length = (vector2.length - _vector1.length); i < length; i++) {
				distance += Math.pow(vector2[item], 2);
			}
		}

		return Math.sqrt(distance);
	};

	// Utility function to compute the max of two elements.
	var max = function (a, b) {
		return (a > b) ? a : b;
	};

	// Configure the map as two-dimensional. Picture as a square grid
	// of width x height with a node at each intersection.
	this.width = config.width || 100;
	this.height = config.height || 100;
	this.somSize = this.width * this.height;

	// Define other parameters.
	this.distanceFunction = config.distanceFunction || euclideanDistance;
	this.initialRadius = config.initialRadius || max(this.width, this.height) / 2;
	this.iterationCount = config.iterationCount;
	this.initialLearningRate = config.initialLearningRate || 0.1;
	this.precision = Math.pow(10, config.precision) || Math.pow(10, (Math.ceil(Math.log(this.somSize) / Math.LN10) + 2));
	this.scale = config.scale || 1;

	// Define our initially empty feature set. Key is feature, value is index
	// in the weights array that that we use to train.
	this.features = {};

	// Mark as first iteration.
	this.currentIteration = 1;
	if (this.iterationCount === undefined || this.iterationCount === null)
	{
		throw Error('Provide in the config object the iteration count as {iterationCount: X} where X is the expected number of iterations');
	}

	this.nodeList = [];
};

// Crete empty nodes.
Som.prototype.init = function (givenNodes) {
	var nodes = givenNodes || {};

	// If we're given a node list, use it! Otherwise, make a new list.
	if (nodes.nodeList && nodes.nodeList.length === somSize) {
		this.nodeList = nodes.nodeList;
	} else {
		var row = 0;
		var column = 0;

		for (var i = 0; i < this.somSize; i++) {
			// Initially, our nodes will be empty.
			var node = new Node({});

			node.x = row;
			node.y = column;
			node.index = i;
			node.label = i % 2 == 0 ? 'up' : 'down';

			column++;

			if (column === this.width) {
				row++;
				column = 0;
			}

			this.nodeList.push(node);
		}
	}
};

// Training method.
Som.prototype.train = function (label, vector) {
	// Capture the current scope.
	var that = this;

	// Keep track of current iteration and throw an error if we overtrain.
	var currentIteration = this.currentIteration;
	if (currentIteration > this.iterationCount) {
		throw Error('ERROR: We can\'t train more than the maximum number of ' + this.iterationCount) + ' times!';
	}

	this.currentIteration += 1;

	// For now, implement a variable learning rate that exponentially decreases.
	var determineLearningRate = function (iterationCount) {
		return that.initialLearningRate * Math.exp(-(iterationCount / that.iterationCount));
	};

	// For now, implement a local radius that exponentially decreases.
	var determineLocalRadius = function (iterationCount) {
		var timeConstant = that.iterationCount / Math.log(that.initialRadius);
		return that.initialRadius * Math.exp(-(iterationCount / timeConstant));
	};

	var getRandomWeight = function () {
		return Math.round(Math.random() * that.precision) / that.precision * that.scale;
	};

	// Determine this iteration's learning and radius.
	var learningRate = determineLearningRate(currentIteration);
	var radius = determineLocalRadius(currentIteration);

	// Does this vector include new features?
	var newFeatures = [];
	for (var feature in vector) {
		if (!that.features.hasOwnProperty(feature)) {
			newFeatures.push(feature);
			that.features[feature] = Object.keys(that.features).length;
		}
	}
	
	// If so, add them to every node!
	newFeatures.forEach(function (feature) {
		that.nodeList.forEach(function (node) {
			var val = getRandomWeight();
			node.weights.push(val);
		});
	});

	// Only then can we find the closest node to the input vector.
	var bestMatchingNode = this.bestMatchingUnit(vector, label);

	// Now, adjust the weights of each nodes accordingly.
	this.nodeList.forEach(function (node) {
		// Calculate the distance between the winning node and the current node.
		var distance = that.distanceFunction([bestMatchingNode.x, bestMatchingNode.y], [node.x, node.y]);

		// If it's close enough, adjust the weight!
		if (distance < radius) {
			// Define influence such that the closer the distance, the higher the influence.
			var influence = Math.exp(-(distance / 2 * radius));
			if (influence <= 0) {
				influence = 1;
			}

			// Negate the influence depending on whether the labels should be the same.
			if(node.label != label) {
				influence *= -1;
			}

			// Adjust the feature weight in the node according to the feature weight in the training set.
			for (var feature in that.features) {
				var featureIndex = that.features[feature];
				var vectorFeature = vector[feature] || 0;
				node.weights[featureIndex] = node.weights[featureIndex] + (influence * learningRate * (vectorFeature - node.weights[featureIndex]));
 			}
		}
	});
};

Som.prototype.bestMatchingUnit = function (vector, label) {
	// Capture the current scope.
	var that = this;

	// Default to the first node as being our best match.
	var bestMatchingUnit = this.nodeList[0];

	var smallestDistance = 1e8;

	// Now, find out the weight vector!
	var weights = [];
	for (var feature in vector) {
		weights[that.features[feature]] = vector[feature] || 0;
	}

	// Iterate through every node and keep track of the closest one!
	this.nodeList.forEach(function (node) {
		var distance = that.distanceFunction(node.weights, weights);

		if (distance < smallestDistance && (label == undefined || node.label == label)) {
			smallestDistance = distance;
			bestMatchingUnit = node;
		}
	});

	return bestMatchingUnit;
};

Som.prototype.classify = function (vector) {
	var bestMatchingUnit = this.bestMatchingUnit(vector);
	return bestMatchingUnit.label;
};

// TODO.
Som.prototype.loadToJson = function () {

};

// TODO.
Som.prototype.saveToJson = function () {

};

exports.create = function (config) {
	return new Som(config);
};