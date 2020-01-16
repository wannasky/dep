#!/usr/bin/env node

const readline = require('readline');
const path = require('path');
const fileUtil = require('./fileUtil');
const execute = require('./execute');
const logger = require('./logger');


let utils = {

    isGitRepo:(repo) => {
        return repo.endsWith('.git');
    },

    check:() => {
        if(!fileUtil.exist(path.join(process.cwd(), '.dep.json'))){
            logger.error(`.dep.json配置文件未发现，请运行'dep init'`);
            process.exit(-1);
        }
    },

    parseRepo: (repo) => {
        if (!repo) return null;
        let index = repo.indexOf(':');
        if (index === -1) return null;
        return {
            module: repo.slice(0, index),
            repo: repo.slice(index + 1)
        }
    },

    isSvnModule: (dir) => {
        return fileUtil.exist(path.join(dir, '.svn'));
    },

    isGitModule: (dir) => {
        return fileUtil.exist(path.join(dir, '.git'));
    },

    deleteSvnFiles: (moduleDir) => {
        let cmd = 'svn list -R';
        let config = require('../config/.config.json');
        if(config.username){
            cmd += ` --username ${config.username}`;
        }
        if(config.password){
            cmd += ` --password ${config.password}`;
        }
        cmd += ` --non-interactiv`;
        cmd += ` --trust-server-cert-failures=unknown-ca,cn-mismatch,expired,not-yet-valid,other`;
        let list = execute.execSync(cmd, {cwd: moduleDir});
        list = list.split('\n');
        // 这里做个处理
        // 先删除文件，文件夹最后判断当前文件夹下是否有其他文件，循环删除
        let files = list.filter(item => !fileUtil.isDirectory(path.join(moduleDir, item)));
        files.forEach(item => fileUtil.removeFile(path.join(moduleDir, item)));
        //删除空的文件夹
        let dirs = list.filter(item => fileUtil.isDirectory(path.join(moduleDir, item)));
        dirs.forEach(item => fileUtil.removeEmptyDirectory(path.join(moduleDir, item)));
        fileUtil.removeFile(path.join(moduleDir, '.svn'));
        fileUtil.removeEmptyDirectory(moduleDir);
    },

    deleteGitFiles: (moduleDir) => {
        let cmd = 'git ls-files -c';
        let list = execute.execSync(cmd, {cwd: moduleDir});
        list = list.split('\n');
        // 这里做个处理
        // 先删除文件，文件夹最后判断当前文件夹下是否有其他文件，循环删除
        let files = list.filter(item => !fileUtil.isDirectory(path.join(moduleDir, item)));
        files.forEach(item => fileUtil.removeFile(path.join(moduleDir, item)));
        //删除空的文件夹
        let dirs = list.filter(item => fileUtil.isDirectory(path.join(moduleDir, item)));
        dirs.forEach(item => fileUtil.removeEmptyDirectory(path.join(moduleDir, item)));
        fileUtil.removeFile(path.join(moduleDir, '.git'));
        fileUtil.removeEmptyDirectory(moduleDir);
    },

    checkout: (repo, target, reversion, options = {}) => {
        let isGit = utils.isGitRepo(repo);
        let args = [];
        let config = utils.getSvnConfig();
        config.svn = config.svn || {};
        config.git = config.git || {};
        args.push(isGit ? 'clone' : 'co');
        if(isGit && config.git.username && config.git.password && (repo.startsWith('https://') || repo.startsWith('http://'))) {
            repo = repo.split('//');
            repo = repo[0] + '//' + config.git.username + ':' + config.git.password + '@' + repo[1];
        }
        args.push(repo);
        if(target){
            args.push(target);
        }
        if(!isGit){
            if(reversion){
                args.push('-r');
                args.push(reversion);
            }
            if(config.svn.username){
                args.push('--username');
                args.push(config.svn.username);
            }
            if(config.svn.password){
                args.push('--password');
                args.push(config.svn.password);
            }
            args.push('--non-interactive');
            args.push('--trust-server-cert-failures=unknown-ca,cn-mismatch,expired,not-yet-valid,other');
        }else{
            args.push('--progress');
        }
        if(isGit && reversion){
            return execute.spawn('git', args, options)
                .then(() => {
                    if(target){
                        return execute.spawn('git', ['checkout', `${reversion}`], {cwd: path.join(process.cwd(), target)});
                    }
                });
        }else{
            return execute.spawn(isGit ? 'git' : 'svn', args, options);
        }
    },

    getSvnConfig: () => {
        try{
            return require('../config/.config.json');
        }catch (e) {
            return {};
        }
    },

    save: (moduleName, repo, position, reversion) => {
        const svnUrl = path.join(process.cwd(), '.dep.json');
        let json = require(svnUrl);
        json.dependencies = json.dependencies || [];
        let index = json.dependencies.findIndex(item => item.module === moduleName)
        if(index !== -1){
            json.dependencies.splice(index, 1);
        }
        let temp = {};
        temp.module = moduleName;
        temp.repo = repo;
        if(position) {
            temp.position = position;
        }
        if(reversion){
            temp.reversion = reversion;
        }
        json.dependencies.push(temp);
        fileUtil.writeFileSync(svnUrl, JSON.stringify(json, null, '\t'));
    },

    saveSvn(json) {
        const svnUrl = path.join(process.cwd(), '.dep.json');
        fileUtil.writeFileSync(svnUrl, JSON.stringify(json, null, '\t'));
    },

    checkoutAndSave: (moduleName, repo, target, reversion, options) => {
        return new Promise((resolve, reject) => {
            utils.checkout(repo, target || moduleName, reversion, options)
                .then(() => {
                    utils.save(moduleName, repo, target, reversion);
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });

    },

    askQuestion: (descs, callback, bkline=true) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let answers = [];

        function main(ds) {
            if (!ds.length) {
                rl.close();
                callback(answers);
            } else {
                let desc = ds.shift();
                desc = bkline ? desc + '\r\n' : desc;
                rl.question(`${desc}`.yellow, (answer) => {
                    answers.push(answer);
                    main(ds);
                });
            }
        }

        main(descs);
    }
}

module.exports = utils;
