var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const natural = require('natural');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
var classifier = new natural.BayesClassifier();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

/*
Clase:
  function procesamientoDeTexto(msg){
	let newTokens = [];
	let punctuation =[',', '.', '¿', '?', '!'];
	let stopWords = ['me', 'we', 'our'];

	const tokenizer = new natural.WordPunctTokenizer();
	const tokens = tokenizer.tokenize(msg);

	for (var i = 0; i <= tokens.length - 1; i++) {
		if(!punctuation.includes(tokens[i]) && 
		   !stopWords.includes(tokens[i])){
			newTokens.push(tokens[i].toLowerCase());
		}
	}
	return newTokens;
}*/

function procesamientoDeTexto(msg){
  	var tokenizer = new natural.WordTokenizer(); 
  	var tokens = tokenizer.tokenize(msg); 

  	natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
  	console.log(classifier.classify(msg));
	
	if (msg === 'Hola'){
		io.emit('chatmsg', "Hola");
	}else if (msg === "¿Cómo estás?"){
		io.emit('chatmsg', "¡Muy bien!");
	}else if (msg === "¿Cómo va tu día?"){
		io.emit('chatmsg', "Tranquilo");
	}else if (msg === "Hago tarea"){
		io.emit('chatmsg', " Ugh, que mal");
	}else if (msg === "Estudio"){
		io.emit('chatmsg', "¿Qué materia?");
	}

	var analyzer = new Analyzer("Spanish", stemmer, "afinn");
	console.log(analyzer.getSentiment(tokens));
	if (msg === '-1'){
		io.emit('chatmsg', "¿Puedo ayudarte con algo?");
	}
	});
	
	if(LanguageDetect == 'english'){
			natural.PorterStemmer.attach();
			tokens = tokenizer.tokenizeAndStem();
	}else if(LanguageDetect == 'spanish'){
			natural.PorterStemmerEs.attach();
			tokens = tokenizer.tokenizeAndStem();
	}
		console.log("enviando mensaje")
		return tokens;
}

io.on('connection', (socket) => {
	console.log('A user connected!');
	socket.on('chatmsg', function(msg){
		/* Tarea:
		if (msg === "Hola"){
			io.emit('chatmsg', "Hi");
		} else if (msg === "¿Cómo va tu día?"){
			io.emit('chatmsg', "Tranquilo");
		} else if (msg === "¿Cómo estás?"){
			io.emit('chatmsg', "¡Muy bien!");
		}*/

		io.emit('chatmsg', procesamientoDeTexto(msg));

	});
});

function clasificado(){

classifier.addDocument('¡Hola!', 'saludos');
classifier.addDocument('¿Cómo estás?', 'saludos');
classifier.addDocument('Hago tarea', 'escuela');
classifier.addDocument('Practico coreano', 'escuela');

classifier.train();

/**/
classifier.save('classifier.json', function(err, classifier) {
console.log("modelo entrenado")
});	

}





http.listen(3000, () => {
	console.log('Server is running ')
	clasificado();
});


