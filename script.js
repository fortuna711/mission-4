document.addEventListener("DOMContentLoaded", () => {
    /**
     * 1. 전역 상태 및 데이터 관리
     */
    let members = []; // 초기 HTML을 읽어 동적으로 채워질 명단 배열

    const randomPool = {
        parts: ["Frontend", "Backend", "Design", "PM"],
        skills: {
            Frontend: ["JavaScript, React, HTML/CSS", "TypeScript, Next.js, Tailwind"],
            Backend: ["Java, Spring Boot, MySQL", "Node.js, Express, MongoDB", "Python, Django, GraphQL"],
            Design: ["Figma, UI/UX, Typography", "Adobe XD, Photoshop, Design Tokens"],
            PM: ["Figma, 서비스 기획, Jira", "Agile, Product Backlog, 데이터 분석"]
        }
    };

    let lastGeneratedImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";
    let lastAction = null;

    /**
     * 2. DOM 요소 선택
     */
    const summaryGrid = document.getElementById('summaryGrid');
    const detailList = document.getElementById('detailList');
    const totalCountLabel = document.getElementById('totalCount');
    const formContainer = document.getElementById('formContainer');
    const memberForm = document.getElementById('memberForm');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const deleteLastBtn = document.getElementById('deleteLastBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    const addRandom1Btn = document.getElementById('addRandom1Btn');
    const addRandom5Btn = document.getElementById('addRandom5Btn');
    const refreshAllBtn = document.getElementById('refreshAllBtn');
    const fillRandomBtn = document.getElementById('fillRandomBtn');

    const filterPart = document.getElementById('filterPart');
    const sortOrder = document.getElementById('sortOrder');
    const searchName = document.getElementById('searchName');
    const statusTextEl = document.querySelector(".status-text");

    /**
     * 3. 초기 화면 데이터 동기화 (지침 4번 구현)
     */
    function initializeDataFromHTML() {
        const initialCards = summaryGrid.querySelectorAll('.profile-card');
        const parsedMembers = [];

        initialCards.forEach(card => {
            const id = card.dataset.id || `member-${Date.now()}`;
            const isMine = card.dataset.isMine === "true"; // 내 카드 여부 플래그
            const name = card.querySelector('.summary-name').innerText;
            const part = card.querySelector('.summary-part').innerText;
            const intro = card.querySelector('.summary-intro').innerText;
            const image = card.querySelector('.image-box img').src;
            const badge = card.querySelector('.badge').innerText;

            // 숨겨진 상세 속성 파싱
            const hiddenData = card.querySelector('.hidden-data');
            const major = hiddenData ? hiddenData.dataset.major : "미설정 전공";
            const email = hiddenData ? hiddenData.dataset.email : "info@lion.com";
            const phone = hiddenData ? hiddenData.dataset.phone : "010-0000-0000";
            const motto = hiddenData ? hiddenData.dataset.motto : "파이팅!";
            const fullIntro = hiddenData ? hiddenData.dataset.fullintro : intro;

            parsedMembers.push({
                id,
                name,
                part,
                major,
                intro,
                fullIntro,
                image,
                badge,
                email,
                phone,
                skills: [badge],
                motto,
                isMine
            });
        });

        members = parsedMembers;
        updateUI(); // 수집 후 화면 동기화 구동
    }

    /**
     * 4. UI 업데이트 및 렌더링 (화면 기준 옵션 계산 - 지침 2, 8번)
     */
    function getFilteredAndSortedMembers() {
        const selectedPart = filterPart.value;
        const keyword = searchName.value.trim().toLowerCase();
        const selectedSort = sortOrder.value;

        // 필터링 및 검색 조건 처리
        let result = members.filter(member => {
            const matchesPart = (selectedPart === '전체' || member.part === selectedPart);
            const matchesName = member.name.toLowerCase().includes(keyword);
            return matchesPart && matchesName;
        });

        // 정렬 조건 처리
        if (selectedSort === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        }

        return result;
    }

    function updateUI() {
        const targetMembers = getFilteredAndSortedMembers();

        if (targetMembers.length === 0) {
            summaryGrid.innerHTML = `<div class="empty-state-box">표시할 아기 사자가 없습니다. (필터/검색 조건을 확인해 주세요)</div>`;
            detailList.innerHTML = `<div class="empty-state-box">표시할 아기 사자가 없습니다. (필터/검색 조건을 확인해 주세요)</div>`;
        } else {
            renderSummaryCards(targetMembers);
            renderDetailCards(targetMembers);
        }

        totalCountLabel.innerText = `총 ${targetMembers.length}명`;
    }

    function renderSummaryCards(targetMembers) {
        summaryGrid.innerHTML = targetMembers.map(member => `
            <article class="profile-card" data-id="${member.id}" ${member.isMine ? 'data-is-mine="true"' : ''}>
                <div class="image-box">
                    <img src="${member.image}" alt="${member.name}">
                    <span class="badge">${member.badge}</span>
                </div>
                <div class="summary-content">
                    <h2 class="summary-name">${member.name}</h2>
                    <p class="summary-part">${member.part}</p>
                    <p class="summary-intro">${member.intro}</p>
                </div>
            </article>
        `).join('');
    }

    function renderDetailCards(targetMembers) {
        detailList.innerHTML = targetMembers.map(member => {
            // 관심 기술을 배열로 변환하여 li 태그들로 생성
            const skillsArray = Array.isArray(member.skills) 
                ? member.skills 
                : member.skills.split(',').map(s => s.trim());
            const skillsListHTML = skillsArray.map(skill => `<li>${skill}</li>`).join('');

            return `
                <div class="detail-card" id="${member.id}">
                    <header class="detail-card-header">
                        <h3>${member.name}</h3>
                        <p class="detail-part">${member.part}</p>
                        <p class="detail-track">LION TRACK</p>
                    </header>
                    <div class="detail-card-body">
                        <div class="detail-section">
                            <h4>자기소개</h4>
                            <p>${member.fullIntro}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>연락처</h4>
                            <ul>
                                <li>Email: ${member.email}</li>
                                <li>Phone: ${member.phone}</li>
                                <li><a href="${member.id === 'member1' ? 'https://visual.story' : 'https://www.lionexample.com'}" target="_blank">${member.id === 'member1' ? 'https://visual.story' : 'https://www.lionexample.com'}</a></li>
                            </ul>
                        </div>

                        <div class="detail-section">
                            <h4>관심 기술</h4>
                            <ul>
                                ${skillsListHTML}
                            </ul>
                        </div>

                        <div class="detail-section">
                            <h4>한 마디</h4>
                            <p>${member.motto}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setStatus(status, message, showRetry = false) {
        const existingRetryBtn = document.getElementById("retryBtn");
        if (existingRetryBtn) existingRetryBtn.remove();

        if (status === "loading") {
            statusTextEl.innerText = message;
            statusTextEl.style.color = "#6b7280";
        } else if (status === "success") {
            statusTextEl.innerText = message;
            statusTextEl.style.color = "#10b981";
            setTimeout(() => {
                if (statusTextEl.innerText === "완료!") {
                    statusTextEl.innerText = "준비 완료";
                    statusTextEl.style.color = "#6b7280";
                }
            }, 3000);
        } else if (status === "error") {
            statusTextEl.innerText = message;
            statusTextEl.style.color = "#ef4444";

            if (showRetry && lastAction) {
                const retryBtn = document.createElement("button");
                retryBtn.id = "retryBtn";
                retryBtn.className = "btn";
                retryBtn.innerText = "재시도";
                retryBtn.addEventListener("click", () => {
                    retryBtn.remove();
                    lastAction();
                });
                statusTextEl.after(retryBtn);
            }
        }
    }

    /**
     * 5. 외부 데이터 비동기 연동 (지침 5, 6번)
     */
    async function fetchRandomUserData(count = 1) {
        try {
            const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`);
            if (!response.ok) throw new Error("API 요청 실패");
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("데이터를 불러오는 중 에러 발생:", error);
            return null;
        }
    }

    function createLionDataObject(apiUser) {
        const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
        
        const firstName = apiUser ? apiUser.name.first : "Clara";
        const lastName = apiUser ? apiUser.name.last : "Lavigne";
        const name = `${firstName} ${lastName}`;
        const email = apiUser ? apiUser.email : `${firstName.toLowerCase()}@example.com`;
        const phone = apiUser ? apiUser.phone : "041 L79-6088";
        const image = apiUser ? apiUser.picture.large : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";

        const part = getRandomElement(randomPool.parts);
        const skillsString = getRandomElement(randomPool.skills[part]);
        const badge = skillsString.split(',')[0].trim();

        return {
            id: `member-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            name: name,
            part: part,
            major: "미설정 전공",
            intro: `${part} · 멋사 아기사자로 합류했어요!`,
            fullIntro: `비동기(async/await)로 받아온 데이터를 컴포넌트 구조에 바인딩하여 렌더링하는 연습 중입니다.`,
            image: image,
            badge: badge,
            email: email,
            phone: phone,
            skills: skillsString.split(',').map(s => s.trim()),
            motto: "데이터가 바뀌면 UI도 바뀐다!",
            isMine: false
        };
    }

    /**
     * 6. 이벤트 컨트롤 바인딩
     */
    filterPart.addEventListener('change', updateUI);
    sortOrder.addEventListener('change', updateUI);
    searchName.addEventListener('input', updateUI);

    toggleFormBtn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        memberForm.reset();
    });

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const skillsValue = document.getElementById('skills').value;
        const newMember = {
            id: `member-${Date.now()}`,
            name: document.getElementById('name').value.trim(),
            part: document.getElementById('part').value,
            major: "미설정 전공",
            intro: document.getElementById('intro').value,
            fullIntro: document.getElementById('fullIntro').value,
            image: lastGeneratedImageUrl,
            badge: skillsValue.split(',')[0].trim(),
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            skills: skillsValue.split(',').map(s => s.trim()),
            motto: document.getElementById('motto').value,
            isMine: false
        };

        members.unshift(newMember);
        updateUI();
        memberForm.reset();
        formContainer.style.display = 'none';
        lastGeneratedImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300";
        setStatus("success", "완료!");
    });

    deleteLastBtn.addEventListener('click', () => {
        if (members.length === 0) return alert("삭제할 멤버가 없습니다.");
        if (confirm("마지막 멤버를 삭제할까요?")) {
            members.pop();
            updateUI();
        }
    });

    const handleAddRandom1 = async () => {
        addRandom1Btn.disabled = true;
        lastAction = handleAddRandom1;
        setStatus("loading", "불러오는 중...");

        const users = await fetchRandomUserData(1);
        if (users) {
            members.unshift(createLionDataObject(users[0]));
            updateUI();
            setStatus("success", "완료!");
        } else {
            setStatus("error", "불러오기 실패: 네트워크 에러", true);
        }
        addRandom1Btn.disabled = false;
    };
    addRandom1Btn.addEventListener('click', handleAddRandom1);

    const handleAddRandom5 = async () => {
        addRandom5Btn.disabled = true;
        lastAction = handleAddRandom5;
        setStatus("loading", "불러오는 중...");

        const users = await fetchRandomUserData(5);
        if (users) {
            for (let i = 0; i < 5; i++) {
                members.unshift(createLionDataObject(users[i]));
            }
            updateUI();
            setStatus("success", "완료!");
        } else {
            setStatus("error", "불러오기 실패: 네트워크 에러", true);
        }
        addRandom5Btn.disabled = false;
    };
    addRandom5Btn.addEventListener('click', handleAddRandom5);

    const handleRefreshAll = async () => {
        if (confirm("대시보드를 초기 상태로 리셋하시겠습니까? (내 카드 제외 모두 교체)")) {
            const currentVisibleCount = getFilteredAndSortedMembers().length;
            const myCards = members.filter(m => m.isMine);
            
            setStatus("loading", "새로운 데이터를 불러오는 중...");
            refreshAllBtn.disabled = true;
            lastAction = handleRefreshAll;

            try {
                const targetFetchCount = Math.max(0, currentVisibleCount - myCards.length);
                let newMembers = [];

                if (targetFetchCount > 0) {
                    const users = await fetchRandomUserData(targetFetchCount);
                    if (!users) throw new Error("API 연동 오류");
                    newMembers = users.map(user => createLionDataObject(user));
                }

                members = [...myCards, ...newMembers];
                updateUI();
                setStatus("success", "완료!");
            } catch (error) {
                setStatus("error", `새로고침 실패: ${error.message}`, true);
            } finally {
                refreshAllBtn.disabled = false;
            }
        }
    };
    refreshAllBtn.addEventListener('click', handleRefreshAll);

    fillRandomBtn.addEventListener('click', async () => {
        fillRandomBtn.innerText = "불러오는 중...";
        fillRandomBtn.disabled = true;
        setStatus("loading", "불러오는 중...");

        const users = await fetchRandomUserData(1);
        if (users) {
            const data = createLionDataObject(users[0]);
            lastGeneratedImageUrl = data.image;

            document.getElementById('name').value = data.name;
            document.getElementById('part').value = data.part;
            document.getElementById('skills').value = data.skills.join(', ');
            document.getElementById('intro').value = data.intro;
            document.getElementById('fullIntro').value = data.fullIntro;
            document.getElementById('email').value = data.email;
            document.getElementById('phone').value = data.phone;
            document.getElementById('website').value = "https://example.com/" + data.name.replace(/\s+/g, '').toLowerCase();
            document.getElementById('motto').value = data.motto;

            setStatus("success", "완료!");
        } else {
            setStatus("error", "불러오기 실패", false);
        }
        fillRandomBtn.innerText = "랜덤 값 채우기";
        fillRandomBtn.disabled = false;
    });

    summaryGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.profile-card');
        if (card) {
            const memberId = card.dataset.id;
            const el = document.getElementById(memberId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-flash');
                setTimeout(() => el.classList.remove('highlight-flash'), 2000);
            }
        }
    });

    initializeDataFromHTML();
});