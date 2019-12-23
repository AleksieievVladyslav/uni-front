var NAME;
var USER;
$(document).ready(function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			USER = true;
			var uid = user.uid;
			$('.userprofile').removeClass('unlogged');
			_getUserStat(uid, NAME);
			$('#logout').off().click(function() {
				firebase.auth().signOut().then(function() {
				  	$('.profile-state').removeClass('active');
					$('.unlogged').addClass('active');
					$('.userprofile').addClass('unlogged');
				}).catch(function(error) {
					alert('Error: \n' + error.message);
				});
			})
		} else {
			// User is signed out.
			// ...
			USER = false;
		}
	});
	$('.registration .submit').click(function() {
		var name = $('#name-reg').val();
		var email = $('#email-reg').val();
		var password = $('#pass-reg').val();
		NAME = name;
		_regUser(email, password);
	});
	$('.login .submit').click(function() {
		var email = $('#email-login').val();
		var password = $('#pass-login').val();
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  alert('Error:\n' + errorMessage);
		  // ...
		});
	});
	$('.login .sub_with_facebook').click(function(e) {
		e.preventDefault();
		var provider = new firebase.auth.FacebookAuthProvider();

		firebase.auth().signInWithPopup(provider).then(function(result) {
			
		  // The signed-in user info.
		  var user = result.user;
		  NAME = user.displayName;
		}).catch(function(error) {
		  var errorMessage = error.message;
		  alert('Error: ' + errorMessage);
		});
	})
	$('.login .sub_with_google').click(function(e) {
		e.preventDefault();
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			
		  // The signed-in user info.
		  var user = result.user;
		  NAME = user.displayName;
		}).catch(function(error) {
		  var errorMessage = error.message;
		  alert('Error: ' + errorMessage);
		});
	});
	$('.registration .sub_with_facebook').click(function(e) {
		e.preventDefault();
		var provider = new firebase.auth.FacebookAuthProvider();

		firebase.auth().signInWithPopup(provider).then(function(result) {
			
		  // The signed-in user info.
		  var user = result.user;
		  NAME = user.displayName;
		}).catch(function(error) {
		  var errorMessage = error.message;
		  alert('Error: ' + errorMessage);
		});
	})
	$('.registration .sub_with_google').click(function(e) {
		e.preventDefault();
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			
		  // The signed-in user info.
		  var user = result.user;
		  NAME = user.displayName;
		}).catch(function(error) {
		  var errorMessage = error.message;
		  alert('Error: ' + errorMessage);
		});
	});
});


function _regUser(email, password) {
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		alert('Error:\n' + errorMessage);
	});
}
function _setUserStat(uid, stat) {
	firebase.database().ref(uid).set({
		Name: stat.name,
		Stars: stat.stars,
		passedTopics: stat.passedTopics,
		questions: stat.questions,
		tests: stat.tests,
		averages: stat.averages
	});
}
function _getUserStat(uid, name) {
	let res = {name: name};
	firebase.database().ref(uid).once('value').then(function(snapshot) {
		if (snapshot.val()) {
			res.name = (snapshot.val().Name) ? snapshot.val().Name : 'Anonymous';
			res.stars = (snapshot.val().Stars) ? snapshot.val().Stars : [0,0,0,0,0,0];
			res.passedTopics = (snapshot.val().passedTopics) ? +snapshot.val().passedTopics : 0;
			res.questions = (snapshot.val().questions) ? snapshot.val().questions : { correct: 0, total: 0};
			res.tests = (snapshot.val().tests) ? snapshot.val().tests : { passed: 0, total: 0};
			res.averages = (snapshot.val().averages) ? snapshot.val().averages : { correctAnswers: 0, time: 0};
		} else {
			res = $.extend(res, {stars: [0,0,0,0,0,0], passedTopics: 0, questions: { correct: 0, total: 0 }, tests: { passed: 0, total: 0 }, 
				averages: { correctAnswers: 0, time: 0} });
		}
		new Profile(res);
		$('.profile-state').removeClass('active');
		$('.logged').addClass('active');
		_setUserStat(uid, res);
		userStatistic = res;
		return res;
	});
}