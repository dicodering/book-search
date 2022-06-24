// 데이터를 저장하기 위한 전역변수
var data = null;
var query = null;
var page = 1;
var is_end = false;

var total = null; // 확인용


// 검색 버튼에 대한 이벤트
document.querySelector("#searchForm").addEventListener("submit", e => {
    e.preventDefault();

    // input에 입력 받은 value값
    const queryField = document.querySelector("#query");
    // 공백 없이 value값 가져오기
    query = queryField.value.trim();

    // 중간에 검색 했을 때도 최상단에 위치하도록
    window.scrollTo(0,0);

    // 무한 스크롤 (+페이지 전환)
    // 스크롤 (페이지가 끝났으면 자료를 더 보여주지 않게 하는 기능)
    window.addEventListener('scroll', (e) => {
        // 스크롤바의 Y좌표
        // -> window.scrollY (None IE)
        // -> document.documentElement.scrollTop (IE)
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // 웹 브라우저의 창 높이
        const windowHeight = window.screen.availHeight;

        // HTML 문서의 높이
        const body = document.body,
                html = document.documentElement;
        const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        
        // 스크롤바의 반동 효과를 고려해서 scrollY + windowHeight가 documentHeight보다 커질 수 있음
        if (scrollY + windowHeight >= documentHeight) {
            // 페이지
            if (is_end == false && page < 50) { // 카카오 size 페이지 최대가 50임
                page += 1;
                APIController();
            } else if (is_end == true) {
                alert("마지막 페이지 입니다.");
                window.scrollTo(0,0);
                return;
            }
        }
    });

    // 검색어가 없을 경우
    if(!query) {
        alert("검색어를 입력하세요.");
        queryField.focus();
        return;
    }

    // ajax
    APIController();
});


// 정렬
function changeSelection() {
    var select = document.querySelector("#selectBox");

    // 선택한(selected) option의 value
    var value = select.options[select.selectedIndex].value;

    if (value == 'desc') {      // 낮은 가격순 정렬
        sort('desc');
    } else if (value == 'asc') { // 높은 가격순 정렬
        sort('asc');
    }
}


// API 컨트롤 : ajax를 통해 데이터 가져오기
function APIController() {
    // ajax 기능을 수행하는 통신 객체
    const xhr = new XMLHttpRequest();
    // 백엔드 페이지에 접속하는 방식
    const method = "GET";
    // 요청(접속)할 대상 페이지 -> 이 파일의 소스코드를 읽어온다.
    const url = 'https://dapi.kakao.com/v3/search/book?query=' + query + '&page=1&size=' + page;

    xhr.onreadystatechange = (e) => { 
        // target만 추출
        const { target } = e;

        // 응답할 준비가 완료 되었을 때
        if (target.readyState == XMLHttpRequest.DONE) {
            // 200 = 응답 성공
            if (target.status == 200) {
                const req = JSON.parse(target.response);
                // 가져온 데이터 전역변수에 저장
                data = req.documents;

                // 페이지 끝 페이지 전이면 false
                is_end = req.meta.is_end;
                console.log(is_end);

                // 토탈 문서 수
                total = req.meta.total_count;
                console.log(total);

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
        for (let j=i+1; j<data.length; j++) {
            // 오름차순 (낮은거 맨 앞)
            if (direction == 'asc') { 
                if (data[i].price > data[j].price) { // i(전)가격이 j(후) 가격보다 높을 때
                    const tmp = data[i];
                    data[i] = data[j];
                    data[j] = tmp;
                }
            } else { // 내림차순 (높은거 맨 앞)
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

    // 검색 내용 초기화 코드
    Array.from(list.getElementsByTagName('li')).map((v, i) => {
        // v.innerHTML = '';
        v.remove();
    });
    
    // 정렬 버튼 오픈
    const dropbox = document.querySelector("#dropbox");
    dropbox.style.visibility = "visible";


    // API에서 불러온 내용 프린트
    data.map((v, i) => {
        // console.log(v);

        // 날짜 (년도-월-일)만 반환
        const element = document.querySelector(".datetime");
        var date = v.datetime;
        var datetime = date.slice(0, 10);

        // 가격 3번째 자리마다 ',' 넣기
        var price = v.price.toLocaleString('ko-KR');

        const html = 
        `
        <li>
            <a href="${v.url}">
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
                    <span class="price">₩${price}</span>
                </div>
            </a>
        </li>
        `
        list.insertAdjacentHTML('beforeend', html)
    });
}