function MusicVisualizer(obj) {
    this.source = null;

    this.count = 0;


    this.analyser = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize =  this.size*2;

    this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
    this.gainNode.connect(MusicVisualizer.ac.destination);

    this.analyser.connect(this.gainNode);

    this.xhr = new XMLHttpRequest();

    this.draw = obj.draw;

}

MusicVisualizer.ac = new(window.AudioContext || window.webkitAudioContext)();

MusicVisualizer.prototype.load = function(url,fun) {
    this.xhr.abort();
    this.xhr.open("GET", url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    this.xhr.onload = function() {
        fun(self.xhr.response);
    };
    this.xhr.send();
}

MusicVisualizer.prototype.play = function(url) {
    var n = ++this.count;
    var self = this;
    this.source && this.stop();
    this.load(url, function(arrbuffer) {
        if (n != self.count) return;
        MusicVisualizer.ac.decodeAudioData(arrbuffer, function(buffer) {
            if (n != self.count) return;
            var bs = MusicVisualizer.ac.createBufferSource();
            bs.buffer = buffer;
            bs.connect(self.analyser);
            self.source = bs;
            self.start();
            self.visualize();
        }, function(err) {
            console.log(err);
        });
    });
}

MusicVisualizer.prototype.stop = function() {
    this.source[this.source.stop ? "stop" : "noteOff"](0);
}

MusicVisualizer.prototype.start = function() {
    this.source[this.source.start ? "start" : "noteOn"](0);
}

MusicVisualizer.prototype.changeVolume = function(percent) {
    this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function() {
    var arr = new Uint8Array(this.analyser.frequencyBinCount);
    var self = this;
    (function v() {
        self.analyser.getByteFrequencyData(arr);
        self.draw(arr);
        requestAnimationFrame(v);
    })();
}