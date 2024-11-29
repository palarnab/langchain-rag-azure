exports.config = {
    spec_dir: '.',
    spec_files: ['**/*[sS]pec.js', '!node_modules/**/*'],
    helpers: ['helpers/**/*.js'],
    stopSpecOnExpectationFailure: false,
    random: false,
    onPrepare: () => {
        jasmine.getEnv().addReporter({
            suiteStarted: function (result) {
                console.log('Suite started: ' + result.description);
            },
            specStarted: function (result) {
                console.log('Spec started: ' + result.description);
            },
        });
    },
};
