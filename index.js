var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const natural = require('natural');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
var classifier = new natural.BayesClassifier();



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

		if(LanguageDetect == 'english'){
			natural.PorterStemmer.attach();
			tokens = tokenizer.tokenizeAndStem();
		}else if(LanguageDetect == 'spanish'){
			natural.PorterStemmerEs.attach();
			tokens = tokenizer.tokenizeAndStem();
		}
		return tokens;

}

io.on('connection', (socket) => {
	console.log('A user connected!');
	socket.on('chatmsg', function(msg){
		/* Tarea:
		if (msg === "Hola"){
			io.emit('chat message', "Hi");
		} else if (msg === "¿Cómo va tu día?"){
			io.emit('chat message', "Tranquilo");
		} else if (msg === "¿Cómo estás?"){
			io.emit('chat message', "¡Muy bien!");
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

}

classifier.save('classifier.json', function(err, classifier) {

});	

natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
});

http.listen(3000, () => {
	console.log('Server is running ')
	clasificado();
});


