var app = angular.module("myApp", ["ngRoute", "satellizer", "firebase"]);


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
			templateUrl : "views/overzicht.html",
			controller : "overzichtController"
		})

		.when("/addIssue", {
			templateUrl : "views/addIssue.html",
			controller : "addIssueController"
		})

		.when("/readme", {
			templateUrl : "views/readme.html",
			controller : "readmeController"
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
	studenten.$loaded()
    .then(function(){
        angular.forEach(studenten, function(user) {
            alleStudenten.push(user);
        })

        
    });

    this.getStudenten = function(){
    	return alleStudenten;
    };
    this.getStudentAt = function(_naam){
    	this.getStudenten();
    	return filterFilter(alleStudenten, {
    		naam: _naam
    	})[0];
    };
}]);

app.controller("loginController", function($scope,$http, $auth){
	$scope.title ="Home";
	 $scope.authenticate = function(provider) {
     	$auth.authenticate(provider);

    };
});

//var accestoken{} = $auth.getToken();


app.controller("overzichtController", function($scope, $http, $firebaseArray, $routeParams, dataService, $rootScope){
	$scope.title ="overzicht";
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();

	console.log($scope.data.studenten);
	console.log($scope.data.studenten[0]);
//	console.log(accestoken)

	this.student = {
		bachelorproef: '',
		bedrijf: '',
		email: '',
		github:'',
		gsm: '',
		naam:'',
		promotor: ''
	};

	var ref = firebase.database().ref().child("studenten");

	this.upload = function(){
		console.log("user clicked upload", this.student);
		var newDataPush = ref.push(this.student);
	};


$scope.commits = [];
commitcount = [];
$scope.issue = [];

/*$http.get("https://api.github.com/authorizations")
	//$http.get($scope.studen.github +"/commits")
	.success(function(results){
   		console.log(results);	
	})
	.error(function(error){
		console.log(error);
	})*/

 /*$http.get('http://localhost:3000/gettoken').then(function(responseData){
        $rootScope.response = responseData.data;
        $rootScope.aToken = $rootScope.response[0].aToken
        console.log($rootScope.aToken);
})*/

var getcommit = function(){

	console.log("init");
	$http.get("https://api.github.com/repos/FlorianPieters/Automatiseringbab/stats/contributors")
	//$http.get($scope.studen.github +"/commits")
	.success(function(results){
   	//	console.log(results[0].total);	
   		commitcount = results;
		$scope.commits = commitcount[0].total;	
	})
	.error(function(error){
		console.log(error);
	})
	 
	
};

var getissues = function(){

	console.log("init");
	$http.get("https://api.github.com/repos/FlorianPieters/Automatiseringbab/issues")
	//$http.get($scope.studen.github +"/commits")
	.success(function(results){
		$scope.issue = results.length;
  	//	console.log(results.length);
	})
	.error(function(error){
		console.log(error);
	})
}
getcommit();
getissues();
});

app.controller("infoController", function($scope, $firebaseArray, $routeParams, dataService){
	$scope.title ="info";
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
});

app.controller("repoController", function($scope,$http, dataService, $routeParams){
	$scope.title ="Repo";
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

});

app.controller("commitController", function($scope,$http, dataService, $routeParams){
	$scope.title ="Commits";
	$scope.commits = [];
	$scope.message = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

var init = function(){

	console.log("init");
	$http.get($scope.student.github +"/commits")
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

app.controller("issuesController", function($scope,$http, dataService, $routeParams){
	$scope.title ="Issues";
	$scope.issues = [];
	$scope.data = {};
	$scope.data.studenten = dataService.getStudenten();
	$scope.student = [];
	$scope.student = dataService.getStudentAt($routeParams.studentNaam);

	$http.get($scope.student.github +"/issues")
	.success(function(results){
		$scope.issues = results;
		console.log(results);
	})
	.error(function(error){
		console.log(error);
	});
});

app.controller("readmeController", function($scope,$http){
	$scope.title = "Readme";
	$scope.readme = [];

	$http.get("https://raw.githubusercontent.com/FlorianPieters/Automatiseringbap/master/README.md")
	.success(function(results){
		console.log(results);
		$scope.readme = results;
	})
	.error(function(error){
		console.log(error);
	});
});

app.controller("addIssueController", function($scope,$http){

	this.issue = {
		title: '',
		body: ''
	};


	this.upload = function(){
		console.log("user clicked upload", this.issue);
	$http.post("https://api.github.com/repos/FlorianPieters/Automatiseringbab/issues?title={{issue.title}}&body={{issue.body}}")
	.success(function(results){
		console.log(results.status);
	})
	.error(function(error){
		console.log(error);
	});
	
	}
});