var app = angular.module("myApp", ["ngRoute", "satellizer", "firebase", "mdMarkdownIt"]);


app.constant("db", {
	url: "https://automatiseringbap.firebaseio.com"
});

app.config(function($routeProvider, $authProvider){
	$routeProvider

		.when("/login", {
			templateUrl : "views/login.html",
			controller : "loginController"
		})

		.when("/overzicht", {
			resolve: {
				"check": function($location, $rootScope){
					if(!$rootScope.loggedIn) {
						$location.path("/login");
					} 
				}
			},
			templateUrl : "views/overzicht.html",
			controller : "overzichtController",
			controllerAs : "ctrl"
		})

		.when("/register", {
			templateUrl : "views/register.html",
			controller : "registerController"
		})

		.when("/addIssue/:studentNaam", {
			templateUrl : "views/addIssue.html",
			controller : "addIssueController",
			controllerAs : "ctrl"
		})

		.when("/logs/:studentNaam", {
			templateUrl : "views/logs.html",
			controller : "logsController"
		})

		.when("/readme/:studentNaam", {
			templateUrl : "views/readme.html",
			controller : "readmeController"
		})

		.when("/scriptie/:studentNaam", {
			templateUrl : "views/scriptie.html",
			controller : "scriptieController"
		})

		.when("/info/:studentNaam", {
			templateUrl : "views/info.html",
			controller : "infoController"
		})

		.when("/commits/:studentNaam", {
			templateUrl : "views/commits.html",
			controller : "commitController"
		})

		.when("/issues/:studentNaam", {
			templateUrl :"views/issues.html",
			controller : "issuesController"
		})

		.when("/lastCommit/:studentNaam", {
			templateUrl :"views/lastCommit.html",
			controller : "lastCommitController"
		})

		.when("/repo/:studentNaam", {
			templateUrl :"views/repo.html",
			controller : "repoController"
		})

		.otherwise({
			redirectTo: "/login"
		});

		$authProvider.github({
      	clientId: 'db2e9e71839b2e01e776',
      	redirectUri: 'http://localhost:3000/index.html#/overzicht'
   		});

});


app.service("dataService", ["$firebaseArray", "filterFilter", function($firebaseArray,filterFilter){
	var studenten = [];
	var ref  = firebase.database().ref().child("studenten");
	studenten = $firebaseArray(ref);

	var alleStudenten = [];

    this.getStudenten = function(){
    		return studenten.$loaded()
    			.then(function(){
       				angular.forEach(studenten, function(user) {
            			alleStudenten.push(user);
        			})
    				return alleStudenten;
				});
    };
    this.getStudentAt = function(_naam){
    	this.getStudenten();
    	return filterFilter(alleStudenten, {
    		naam: _naam
    	})[0];
    };
}]);

app.service("dataService2", ["$firebaseArray", "filterFilter","$q", function($firebaseArray,filterFilter,$q){
	var studenten = [];
	var ref  = firebase.database().ref().child("studenten");
	studenten = $firebaseArray(ref);
	//console.log(studenten);
	//console.log("in dataservice");
	
	var alleStudenten = [];
	

	

    this.getStudenten = function(){
    	 var deferred = $q.defer();

    	var ref  = firebase.database().ref().child("studenten");
    	var st = $firebaseArray(ref)
    	

		st.$loaded()
    		.then(function(data){
      			 // angular.forEach(data, function(user) {
      			 //	console.log(data);
        	deferred.resolve(data);
			//console.log(user)
           		// alleStudenten.push(user);
      //  })

        
    });
    	
		return   deferred.promise;//;
	
    	//return alleStudenten;
    };
    this.getStudentAt = function(_naam){
    	this.getStudenten();
    	return filterFilter(alleStudenten, {
    		naam: _naam
    	})[0];
    };
}]);

app.controller("loginController", function($scope,$http, $auth, $rootScope, $location, $firebaseArray){
	$scope.title ="Login";
	var ref = firebase.database().ref().child("users");
	$scope.users =[ ];
	$scope.users = $firebaseArray(ref);

	$scope.submit = function(){
		console.log("submit");
		for(var i= 0; i < $scope.users.length; i++ ){
			if($scope.Username == $scope.users[i].username){
				$rootScope.username = $scope.Username;
				console.log("username checks out");
				if($scope.password == $scope.users[i].password){
					console.log("password checks out");
					$rootScope.password = $scope.password;
					$rootScope.loggedIn = true;
					$location.path('/overzicht');
				}
			} 
		}
		if(!$rootScope.loggedIn){
			alert("wrong credentials");
		}
	};
});

app.controller("registerController", function($scope, $http){
	$scope.title = "Register";
	this.user = {
		username : "",
		password : ""
	};
	var ref = firebase.database().ref().child("users");
	$scope.submit = function(){
		console.log("user clicked submit");
		var newDataPush = ref.push(this.user);
	}
});

app.controller("overzichtController", function($scope, $rootScope, $http, $firebaseArray, $routeParams, dataService){
	console.log("overzichtController");
	$scope.title ="overzicht";
	$scope.data = {};
	$scope.data.studenten = [];
	$rootScope.userStudenten = [];
	//$rootScope.userStudenten.splice(0, $rootScope.userStudenten.length);
	var getUserStudenten = function(){
		dataService.getStudenten().then(function(studenten){
			console.log("Studenten received.");
			
			if($rootScope.username == "admin"){
				//$scope.userStudenten.splice(0, $scope.userStudenten.length);
				for(var i=0 ; i<studenten.length ; i++ ){
				$rootScope.userStudenten.splice(i,$rootScope.userStudenten.length,studenten[i]);
			}
				//console.log($scope.userStudenten);
			
			} else {
				//$scope.userStudenten.splice(0, $scope.userStudenten.length);
			for(var i=0 ; i<studenten.length ; i++ ){
    			if(studenten[i].username == $rootScope.username){
    				if($rootScope.userStudenten.indexOf(current)<0){
    				$rootScope.userStudenten.splice(i,$rootScope.userStudenten.length,studenten[i]);
    			}
    	}
    	}
    }
	});
	}
	
	getUserStudenten();
	

		this.student = {
		bachelorproef: '',
		bedrijf: '',
		email: '',
		gitUserName:'',
		gitRepo:'',
		gsm: '',
		naam:'',
		promotor: '',
		username : $rootScope.username
	};

	var ref = firebase.database().ref().child("studenten");

	this.upload = function(){
		console.log("user clicked upload", this.student);
		var newDataPush = ref.push(this.student);
	};
});

app.controller("infoController", function($scope,$rootScope, $http, $firebaseArray, $routeParams, dataService){
	$scope.title ="info";
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	console.log($scope.data.studenten);
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	console.log($scope.student);
	$scope.commits = [];
	$scope.issues = [];
	$scope.divColor = "blue";



	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/commits")
	.success(function(results){
		$scope.commits = results;
		console.log($scope.commits);
		console.log($scope.commits.length);
	})
	.error(function(error){
		console.log(error);
	});

	$http.get("http://api.github.com/repos/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/issues")
	.success(function(results){
		$scope.issues = results;
	})
	.error(function(error){
		console.log(error);
	});


	// activiteit bol
var getLastSha = function(){

	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits?access_token=452c67b46a514247c4844b4b7fc306850ac9752e")
	.success(function(results){
		//$scope.commits = results;
		//console.log(results);
		$scope.lastSha = results[0].sha;
		//console.log($scope.lastSha);
		//console.log("TESTING");
		//console.log($scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits/" + $scope.lastSha);
		//getLastCommit();

		getLastCommit();

	})
	.error(function(error){
		console.log(error);
	})
}

var getLastCommit = function(){

	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits/" + $scope.lastSha + "?access_token=452c67b46a514247c4844b4b7fc306850ac9752e" )
	.success(function(results){
		//console.log($scope.commitDate);
		//console.log("in last commit");
		//console.log(results);
		//console.log(results.commit.author.date);
		$scope.gitDate =results.commit.author.date;
		$scope.lastDate = $scope.gitDate.split("T");
		$scope.commitDate = $scope.lastDate[0]; 

		checkActivity();


	})
	.error(function(error){
		console.log(error);
	})
}

var checkActivity = function(){
	
var date = new Date();
	$scope.currentDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
	console.log($scope.currentDate); // huidige datum 2017-01-05 format
	$scope.parseCurDate = $scope.currentDate.split("-");
	$scope.curYear = parseInt($scope.parseCurDate[0]);
	//console.log($scope.curYear);
	$scope.curMonth = parseInt($scope.parseCurDate[1]);
	//console.log($scope.curMonth);
	$scope.curDay = parseInt($scope.parseCurDate[2]);
	//console.log($scope.curDay);
	

	//console.log($scope.lastDate[0]); // dees is den datum bv. "2017-01-05"
	$scope.parseLastDate = $scope.lastDate[0].split("-"); 	
	console.log($scope.parseLastDate[0]); 
	// array 2017,01,05
	$scope.lastYear = parseInt($scope.parseLastDate[0]);
	console.log($scope.lastYear);
	$scope.lastMonth = $scope.parseLastDate[1];
	console.log($scope.lastMonth);
	$scope.lastDay = parseInt($scope.parseLastDate[2]);
	console.log($scope.lastDay);
	$scope.maxD = parseInt(7);
	$scope.maxDay =  ($scope.lastDay + $scope.maxD);
	//console.log($scope.maxDay);


//$scope.dayDiffrence = "";
//$scope.monthDays = "";
//$scope.curMonth = 2;
	if ($scope.curYear  > $scope.lastYear && $scope.lastMonth !== 12) {
		$scope.dayDiffrence = "inactief";
	}

	if (($scope.curMonth -1)  > $scope.lastMonth) {
		$scope.dayDiffrence = "inactief";
		console.log($scope.dayDiffrence);
	}

	
	if ((($scope.curMonth -1)  == $scope.lastMonth) || (($scope.curYear -1) == $scope.lastYear && $scope.lastMonth == 12)) {



		if ($scope.lastMonth == 2){

			$scope.monthDays = 28 - parseInt($scope.lastDay);
		}
		if ($scope.lastMonth == 4 || $scope.lastMonth == 6 || $scope.lastMonth == 9 || $scope.lastMonth == 11) {

			$scope.monthDays = 30 - parseInt($scope.lastDay);

		}
		else {
			$scope.monthDays = 31 - parseInt($scope.lastDay);
		}

			$scope.dayDiffrence = parseInt($scope.monthDays) + parseInt($scope.curDay);
			console.log($scope.dayDiffrence);

	}
	if ($scope.curMonth   == $scope.lastMonth) {
		$scope.dayDiffrence = parseInt($scope.curDay) - parseInt($scope.lastDay);
		console.log($scope.dayDiffrence);
	}

	if ($scope.dayDiffrence < 7) {
		console.log("gj")
		$scope.divColor = "green";
		//divcolor groen
	}
	if ($scope.dayDiffrence >= 7 || $scope.dayDiffrence == "inactief") {
		console.log("fail")
		$scope.divColor = "red";
		//divcolor rood
	}
		

	
}



	getLastSha();

});

app.controller("repoController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title ="Repo";
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

});

app.controller("commitController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title ="Commits";
	$scope.commits = [];
	$scope.message = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

var init = function(){

	console.log("init");
	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName +"/" + $scope.student.gitRepo +"/commits?access_token=452c67b46a514247c4844b4b7fc306850ac9752e")
	.success(function(results){
		$scope.commits = results;
		for(var i=0; i < $scope.commits.length; i++){
			var current = $scope.commits[i].commit.message;
			if($scope.message.indexOf(current)<0){
				$scope.message.push(current);
			}
		}
		console.log(results);
		console.log(results.header);
		console.log($scope.message);
	})
	.error(function(error){
		console.log(error);
	})
}

	init();
	$scope.commitaantal = $scope.commits.length;
});

app.controller("issuesController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title ="Issues";
	$scope.issues = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	console.log("issuescontroller");
	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo +"/issues?access_token=452c67b46a514247c4844b4b7fc306850ac9752e")
	.success(function(results){
		$scope.issues = results;
		console.log(results);
	})
	.error(function(error){
		console.log(error);
	});
});

app.controller("readmeController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title = "Readme";
	$scope.markdown = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	console.log($scope.student);

	$http.get("https://raw.githubusercontent.com/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/master/README.md")
	.success(function(results){
		console.log(results);
		$scope.markdown = results;
	})
	.error(function(error){
		console.log(error);
	});

	var converter = new showdown.Converter(),
		text = $scope.readme,
		html = converter.makeHtml(text);

});

app.controller("addIssueController", function($scope,$http, $rootScope, dataService, $routeParams){

	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);


		$scope.issue = {
		title: '',
		body: ''
	};
	var url = "https://api.github.com/repos/FlorianPieters/Automatiseringbap/issues"




	this.upload = function(){
		console.log("user clicked upload", this.issue);
	/*$http.post("https://api.github.com/repos/FlorianPieters/Automatiseringbap/issues", this.issue)
	.success(function(results){
		console.log(results.status);
	})
	.error(function(error){
		console.log(error);
	});*/
	$http({
		method:"POST", url , headers: { "Authorization" : "Basic " + $rootScope.username + " : " + $rootScope.password  }
	})
	.success(function(issue){
		console.log(issue);
		success(issue);
	})
	.error(function(issue){
		console.log(issue);
	})
	
	}
});

app.controller("lastCommitController", function($scope,$http , dataService, $routeParams, $rootScope){
	$scope.title = "Laatste Commit";
	$scope.commitTitle = "" ;
	$scope.commitDate ="";
	$scope.gitDate ="";
	$scope.commitA = "";
	$scope.commitR = "";
	$scope.commitT = "";
	$scope.commitUrl = "";
	
	$scope.lastSha ="";

	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	//console.log($scope.student.gitUserName);

	


var getLastSha = function(){

	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits?access_token=452c67b46a514247c4844b4b7fc306850ac9752e")
	.success(function(results){
		//$scope.commits = results;
		//console.log(results);
		$scope.lastSha = results[0].sha;	
		console.log($scope.lastSha);
		//console.log("TESTING");
		//console.log($scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits/" + $scope.lastSha);
		//getLastCommit();

		getLastCommit();

	})
	.error(function(error){
		console.log(error);
	})
}

var getLastCommit = function(){

	$http.get("https://api.github.com/repos/" + $scope.student.gitUserName +"/" + $scope.student.gitRepo + "/commits/" + $scope.lastSha + "?access_token=452c67b46a514247c4844b4b7fc306850ac9752e" )
	.success(function(results){
		//$scope.commits = results;
		
		console.log($scope.commitDate);

		console.log("in last commit");
		console.log(results);
		console.log(results.commit.message);
		$scope.commitTitle = results.commit.message;
		console.log(results.commit.author.date);
		$scope.gitDate =results.commit.author.date;
		$scope.commitA = results.stats.additions;
		$scope.commitR = results.stats.deletions;
		$scope.commitT = results.stats.total;
		$scope.commitUrl = results.html_url;
		console.log(results.html_url);

		$scope.lastDate = $scope.gitDate.split("T");
		$scope.commitDate = $scope.lastDate[0];



	})
	.error(function(error){
		console.log(error);
	})
}

/*
var weekCommit = function(){

	$http.get("https://api.github.com/repos/FlorianPieters/Automatiseringbap/stats/code_frequency")
	.success(function(results){
		laatsteWeek = results.length -1;
		console.log(results);
		//console.log(results[laatsteWeek]);
		$scope.activity = results[laatsteWeek];
		console.log($scope.activity);

		
		console.log(results)
		;

	})
	.error(function(error){
		console.log(error);
	})
}*/


	getLastSha();
	
	
	this.comment = {
		
		body: ''
	};

var commentcommit = function(){

	$http.get("https://api.github.com/repos/FlorianPieters/Automatiseringbap/commits/913258dd98e8f86f5320971d6cdf8b794d0a23e8/comments?body={{comment.body}}")
	.success(function(results){
		//$scope.commits = results;
		

	})
	.error(function(error){
		console.log(error);
	})
}



});

app.controller("readmeController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title = "Readme";
	$scope.markdown = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	console.log($scope.student);

	$http.get("https://raw.githubusercontent.com/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/master/README.md")
	.success(function(results){
		console.log(results);
		$scope.markdown = results;
	})
	.error(function(error){
		console.log(error);
	});

	var converter = new showdown.Converter(),
		text = $scope.readme,
		html = converter.makeHtml(text);

});

app.controller("scriptieController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title ="Scriptie";
	$scope.markdown = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

	$http.get("https://raw.githubusercontent.com/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/master/Scriptie/Scriptie.md")
	.success(function(results){
		console.log(results);
		$scope.markdown = results;
	})
	.error(function(error){
		console.log(error);
	});

});

app.controller("logsController", function($scope,$http, dataService, $routeParams, $rootScope){
	$scope.title ="Logs";
	$scope.markdown = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

	$http.get("https://raw.githubusercontent.com/" + $scope.student.gitUserName + "/" + $scope.student.gitRepo + "/master/Log/Log.md")
	.success(function(results){
		console.log(results);
		$scope.markdown = results;
	})
	.error(function(error){
		console.log(error);
	});

});
