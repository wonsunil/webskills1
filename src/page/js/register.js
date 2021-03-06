window.onload = () => {
	let form = document.querySelector("form");
	form.addEventListener("submit", function(e) {
		e.preventDefault();

		if(empty_check(this.children)) {
			if(same_check(this.children)) {
				if(form_check(this.children)) {
					if(cap_check(this.children)){
						email_fetch(this.children[0]);
					};
				};
			}else alert("비밀번호가 다릅니다.");
		};
	});
	form.children[6].innerHTML = generate_capCha();

	let birthday = form.children[4];
	birthday.addEventListener("keyup", function(e) {
		let limit = 10;

		if(this.value.length > limit) 
			this.value = this.value.slice(0, limit);

		this.value = birth_switch(this.value);
	});

	let img = form.children[5];
	img.addEventListener("change", function(e) {
		if(file_type_check(e.target.value) != null) {
			return true;
		}else {
			e.target.value = "";
			alert("이미지 파일만 선택가능합니다");
			return false;
		};
	});

	function empty_check(target) {
		let check = false;

		for(let i = 0; i < target.length; i++) {
			if(i > 4) continue;
			else {
				if(target[i].value == "") {
					target[i].focus();
					alert(name_switch(target[i].getAttribute("name")) + "칸이 비었습니다.");
					check = false;
					break;
				}else check = true;
			};
		}

		return check;
	};
	function same_check(target) {
		let check = false;

		if(target[1].value == target[2].value) check = true;
		else check = false;

		return check;
	};
	const file_type_check = img => img.match(new RegExp(/\.png|\.jpg|\.jpeg|\.git|\.bmp/));
	function form_check(target) {
		let email = target[0];	  // 영어 이메일 형식
		let pw = target[1]; 	  // 영어 대소문자, 숫자, 특수문자(0~9까지만 가능) 혼합
		let name = target[3]; 	  // 한국어, 영어, 숫자(숫자만 제외) 2~10글자
		let birthday = target[4]; // [yyyy-mm-dd] 1920-01-01 ~ 현재

		let email_result = email.value.match(new RegExp(/[A-Z|a-z|0-9]*@[A-Za-z]*\.[A-Z|a-z]{2,3}/g));
		let email_result2 = email.value.match(new RegExp(/[A-Z|a-z|0-9]*@[A-Za-z]*\.[A-Z|a-z]{2,3}\.[A-Z|a-z]*/g));
		let pw_result = pw.value.match(new RegExp(/^[A-Za-z0-9!@#$%^&*()]*$/g));
		let name_result = name.value.match(new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|A-Z|a-z]{2,10}$/g));
		let birth_result = birth_check(birthday.value);

		let target_arr = [email, pw, name];
		let arr = [pw_result, name_result];

		if(email_result2 == null) arr.unshift(email_result);
		else arr.unshift(email_result2);

		let check = true;

		arr.forEach((item, index) => {
			if(item == undefined || null || false) {
				check = false;
				alert(name_switch(target_arr[index].getAttribute("name")) + "칸의 형식이 잘못되었습니다");
				target_arr[index].focus();
			}else check = true;
		});
		
		if(birth_result == false) {
			check = false;
			alert("생년월일칸의 형식이 잘못되었습니다");
			birthday.focus();
		};

		return check;
	};
	function birth_check(birth) {
		let year = birth.substr(0, 4);
		let month = birth.substr(5, 2);
		let day = birth.substr(8, 10);

		let year_check = 1920 < year && year < new Date().getFullYear();
		let month_check = 0 < month && month < 13;
		let day_check = 0 < day && day <= 31;

		if(year_check && month_check && day_check)
			return true;
		else
			return false;
	};
	function cap_check(target) {
		let cap = target[6];
		let i_cap = target[7];

		if(cap.innerHTML == i_cap.value) return true;
		else{
			alert("캡차 입력이 일치하지 않습니다");
			cap.innerHTML = generate_capCha();
			i_cap.value = "";
			i_cap.focus();
		};
	};

	function birth_switch(num) {
		let number = num.replace(/[^0-9]/g, "");
		let result = "";

		if(number.length <= 4) {
			return number;
		}else if(number.length < 7) {
			result += number.substr(0, 4);
			result += "-";
			result += number.substr(4);
		}else if(number.length < 11) {
			result += number.substr(0, 4);
			result += "-";
			result += number.substr(4, 2);
			result += "-";
			result += number.substr(6);
		};

		return result;
	};
	function name_switch(name) {
		switch(name) {
			case "email" : return "이메일";
			case "password" : return "비밀번호";
			case "password-check" : return "비밀번호 재입력";
			case "name" : return "이름";
			case "birthday" : return "생년월일";
		};
	};

	function generate_capCha() {
		let capCha = "";

		let arr = [];
		let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

		for(let i = 0; i < 6; i++) 
			arr.push(Math.floor(Math.random() * 2));
		
		arr.forEach(item => {
			if(item == 0) 
				capCha += alpha.charAt(Math.floor(Math.random() * alpha.length));
			else
				capCha += Math.floor(Math.random() * 10);
		});

		return capCha;
	};

	function email_fetch(email) {
		let url = "../account/Duplicate.php";
		let form = new FormData();
		form.append("email", email.value);

		fetch(url, {
			mode: "cors",
			method: "post",
			headers: {
				"Access-Control-Allow-Origin" : "*"
			},
			body: form
		})
		.then(req => {return req.json()})
		.then(res => {
			if(email_duplicate(res.message))
				email.parentNode.submit();
		})
		.catch(err => console.log(err));
	};
	function email_duplicate(msg) {
		let check = false;

		if(msg == "duplicate") {
			var li = document.querySelector("li[name='duplicate-error']");
			if(li) document.body.removeChild(li);

			var li = document.createElement("li");
			li.setAttribute("name", "duplicate-error");
			li.innerHTML = "중복된 이메일입니다.";

			document.body.append(li);

			check = false;
		}else {
			let li = document.querySelector("li[name='duplicate-error']");
			if(li) document.body.removeChild(li);

			check = true;
		};

		return check;
	};
};