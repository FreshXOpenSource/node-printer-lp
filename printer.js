var Job = require ("./job");
var spawn = require("child_process").spawn;
var _ = require ("underscore");

var optionsFactory = function (options) {
    var defaultOptions = {};
    
    defaultOptions.encryption = false;
    defaultOptions.username = null;
    defaultOptions.backwardsCompatibility = false;
    defaultOptions.destination = null;
    defaultOptions.hostname = null;
    defaultOptions.numCopies = 1;
    defaultOptions.priority = 1;
    defaultOptions.media = "a4";
    defaultOptions.fitplot = false;
    defaultOptions.convertToPS = false;
    
    return _.defaults(options, defaultOptions);
};

var argsFactory = function (options) {
    var args = [];

    if (true === options.encryption) {
        args.push ("-E");
    }
    
    if (_.isString(options.username)) {
        args.push("-U");
        args.push(options.username);
    }
    
    if (true === options.backwardsCompatibility) {
        args.push("-c");
    }
    
    if (_.isString(options.destination)) {
        args.push("-d");
        args.push(options.destination);
    }

    if (_.isString(options.orientation)) {
        args.push("-o");
        args.push(options.orientation);
    }
    
    if (_.isString(options.hostname)) {
        args.push("-h");
        args.push(options.hostname);
    }
    
    if (_.isNumber(options.numCopies) && options.numCopies > 1) {
        args.push("-n");
        args.push(options.numCopies);
    }
    
    if (_.isNumber(options.priority) && options.priority > 1) {
        args.push("-q");
        args.push(options.priority);
    }
    
    if (_.isString(options.media)) {
        args.push("-o");
        args.push("media=" + options.media);
    }
    
    if (_.isString(options.inputSlot)) {
        args.push("-o");
        args.push("inputSlot=" + options.inputSlot);
    }
    
    if (true === options.fitplot) {
        args.push("-o");
        args.push("fitplot");
    }
    
    if (true === options.fitToPage) {
        args.push("-o");
        args.push("fit-to-page");
    }

    if (_.isNumber(options.numberUp) && options.numberUp > 1) {
        args.push("-o");
        args.push("number-up=" + options.numberUp);
    }
    
    return args;
};

module.exports.printText = function (text, options, identifier) {
    options = optionsFactory(options);
    
    var args = argsFactory(options);

    var lp;

    if(options.convertToPS == true){
        // convert to ps before printing using pdftops
        var convert = spawn("pdftops", ["-","-"]);
        lp = spawn("lp", args);
        convert.stdin.write(text);
        convert.stdout.pipe(lp.stdin);
        convert.stdin.end();
    } else {
        lp = spawn("lp", args);
        lp.stdin.write(text);
        lp.stdin.end();
    }

    return new Job(lp, identifier);
}

module.exports.printFile = function (file, options, identifier) {
    options = optionsFactory(options);
    
    var args = argsFactory(options);
    var lp;
    
    if(options.convertToPS == true){
        // convert to ps before printing using pdftops
        var convert = spawn("pdftops", [file, "-"]);
        lp = spawn("lp", args);
        convert.stdout.pipe(lp.stdin);
    } else {
        args.push ("--");
        args.push (file);
        lp = spawn("lp", args);
    }

    return new Job(lp, identifier);
}
