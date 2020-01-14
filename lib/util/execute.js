const {spawn, execSync} = require('child_process');

module.exports = {

    spawn: (command, args, options = {}) => {
        return new Promise((resolve, reject) => {
            const cmd = spawn(command, args, options);
            cmd.stdout.on('data', data => {
                console.log(data.toString().replace('\n', ''));
            });
            cmd.stderr.on('data', (data) => {
                console.log(data.toString());
            });
            cmd.on('close', code => {
                if(code === 0) {
                    resolve();
                }else{
                    reject();
                }
            })
        });
    },

    execSync: (command, options = {}) => {
        return execSync(command, options).toString();
    }
}
