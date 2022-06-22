

// 데이터를 저장하기 위한 전역변수
var data = null;
var query = null;

// 검색 버튼에 대한 이벤트
document.querySelector("#searchForm").addEventListener("submit", e => {
    e.preventDefault();

    // input에 입력 받은 value값
    const queryField = document.querySelector("#query");
    // 공백 없이 value값 가져오기
    query = queryField.value.trim();

    // 검색어가 없을 경우
    if(!query) {
        alert("검색어를 입력하세요.");
        queryField.focus();
        return;
    }

    // ajax
    APIController();
});

// sort : 낮은 가격순 정렬
document.querySelector('#descBtn').addEventListener("change", (e) => sort('desc'));

// sort : 높은 가격순 정렬
document.querySelector('#ascBtn').addEventListener("change", (e) => sort('asc'));


// API 컨트롤 : ajax를 통해 데이터 가져오기
function APIController() {
    // ajax 기능을 수행하는 통신 객체
    const xhr = new XMLHttpRequest();
    // 백엔드 페이지에 접속하는 방식
    const method = "GET";
    // 요청(접속)할 대상 페이지 -> 이 파일의 소스코드를 읽어온다.
    const url = 'https://dapi.kakao.com/v3/search/book?query=' + query;

    xhr.onreadystatechange = (e) => { 
        // target만 추출
        const { target } = e;

        // 응답할 준비가 완료 되었을 때
        if (target.readyState == XMLHttpRequest.DONE) {
            // 200 = 응답 성공
            if (target.status == 200) {
                const req = JSON.parse(target.response);
                console.log(req);
                // 가져온 데이터 전역변수에 저장
                data = req.documents;

                // UI 프린트
                UIController();
            } else { // 4xx,5xx = 응답 실패
                const s = parseInt(target.status / 100);
                let errMsg = null;

                if (s == 4) {
                    errMsg = '[' + target.status + ']' + target.statusText + '- 요청 주소가 잘못되었습니다.';
                } else if (s == 5) {
                    errMsg = '[' + target.status + ']' + target.statusText + '- 서버 응답이 없습니다.';
                } else {
                    errMsg = '[' + target.status + ']' + target.statusText + '- 요청에 실패했습니다.';
                }

                alert(errMsg);
            }
        }
    };

    xhr.open(method, url);
    // 카카오 key
    xhr.setRequestHeader('Authorization', 'KakaoAK 150adfca464ff8bb1cb57e86d77f8166');
    xhr.send();
}


// 정렬 함수(sort)
function sort(direction) {
    // data에 대한 정렬 (data는 검색해서 나온 갯수)
    for (let i=0; i<data.length-1; i++) {
        for (let j=i+1; j<data.length; i++) {
            // 내림차순 (낮은거 맨 앞)
            if (direction == 'desc') { 
                if (data[i].price > data[j].price) { // i(전)가격이 j(후) 가격보다 높을 때
                    const tmp = data[i];
                    data[i] = data[j];
                    data[j] = tmp;
                }
            } else { // 오름차순 (높은거 맨 앞)
                if (data[i].price < data[j].price) { // 뒤에가 더 클 때
                    const tmp = data[i];
                    data[i] = data[j];
                    data[j] = tmp;
                }
            }
        }
    }

    UIController();
}

// UI Module 화면에 data내용을 출력하는 메소드
function UIController() {
    const list = document.querySelector("#list");

    // Array.from() 함수로 배열을 생성하고 초기화
    Array.from(list.getElementsByTagName('li')).map((v, i) => {
        removeChild(v);
    });




    data.map((v, i) => {
        console.log(v);

        const element = document.querySelector(".datetime");
        console.log(element);
        var date = v.datetime;
        var datetime = date.slice(0, 10);

        const html = 
        `
        <li>
            <a href="#">
                <!-- 섬네일 -->
                <div id="thumb">
                    <span class="thumbnail" style="background-image: url(${v.thumbnail})"></span>
                </div>

                <!-- 정보 -->
                <div id="info">
                    <!-- 제목 -->
                    <h2>${v.title}</h2>

                    <!-- 작가 / 출판사 / 출간일 -->
                    <div class="subinfo">
                        <span class="author">${v.authors}</span>
                        <span class="publisher">${v.publisher}</span>
                        <span class="datetime">
                            ${datetime}
                        </span>
                    </div>

                    <!-- 책 간략 소개 -->
                    <p>${v.contents}</p>
                </div>

                <!-- 가격 -->
                <div id="priceBox">
                    <span class="price">${v.price}</span>
                </div>
            </a>
        </li>
        `
        list.insertAdjacentHTML('beforeend', html)


    });
}


// UI & API 컨트롤