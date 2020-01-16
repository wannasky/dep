# dep
管理svn/git项目依赖

## 为什么需要
在同时使用svn和git进行模块管理的项目，需要对依赖的多个模块进行管理，这时候就需要一个`.dep.json`的文件来管理项目的依赖及版本。同时亦方便了项目构建及部署。

## 如何使用

1. dep init

	初始化，根据提示输入信息后确认生成`.dep.json`文件
	
2. dep config

    添加svn/git用户名和密码
    
    ```bash
    // 添加svn/git用户名和密码
    dep config -t svn -u username -p password
    
    dep config -t git -u username -p password
   
    // 从env读取并添加svn/git用户名和密码
    dep config -t svn -e -u SVN_USER_NAME -p SVN_PASSWORD
    
    dep config -t git -e -u GIT_USER_NAME -p GIT_PASSWORD
   
    // 查看当前svn/git用户名和密码
    dep config -l
    ```
   
3. dep add

	添加一个svn/git模块依赖

	```bash
    // 添加hato模块到hato目录
    dep add hato:https://svn.nsfocus.com/svn/cloud/Hato/trunk/html/tembin/

    dep add hato:https://github.com/svn/cloud/Hato/trunk/html/tembin.git
    
    // 添加hato模块到rename目录
    dep add hato:https://svn.nsfocus.com/svn/cloud/Hato/trunk/html/tembin/ ./rename

    dep add hato:https://github.com/svn/cloud/Hato/trunk/html/tembin.git ./rename
    
    // 添加指定版本的
    dep add hato:https://svn.nsfocus.com/svn/cloud/Hato/trunk/html/tembin/ -r 86354

    dep add hato:https://github.com/svn/cloud/Hato/trunk/html/tembin.git -r 86354
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
