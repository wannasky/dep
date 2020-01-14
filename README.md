# dep
管理svn项目依赖

## 为什么需要
在一些使用svn作为版本管理的项目中，需要依赖多个模块（这些模块也是通过svn进行版本管理的），这时候我们就需要一个类`package.json`的文件用来管理项目中的svn模块依赖。

## 如何使用

1. dep init

	初始化，和`npm init`相似
	
2. dep config

    添加svn用户名和密码
    
    ```bash
    // 添加svn用户名和密码
    dep config -u username -p password
   
    // 从env读取并添加svn用户名和密码
    dep config -e -u SVN_USER_NAME -p SVN_PASSWORD
   
    // 查看当前svn用户名和密码
    dep config -l
    ```
   
3. dep add

	添加一个svn模块依赖

	```bash
    // 添加report模块到report目录
	dep add report:https://svn.repo.com/code/trunk
 
    // 添加report模块到rename目录
	dep add report:https://svn.repo.com/code/trunk ./rename
 
    // 添加84578版本的report模块到report目录 
	dep add report:https://svn.repo.com/code/trunk -r 84578
	```

4. dep remove

    删除一个依赖模块
    
    ```bash
    dep remove report
    ```
   
5. dep install

    安装所有项目依赖
    
6. dep list

    查看项目依赖       
