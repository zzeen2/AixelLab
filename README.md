## AI model Study
### Study #1 - Stable Diffusion local model

- **환경:** 부적합해서 탈락
- **결과:**  
  - 로컬 모델 실행 시 GPU가 필수(없음)
- **결론:**  
  - 로컬 모델 실험은 시간도 오래 걸리고, 현재 내 개발 환경에서는 불가능


### Study #1 - Replicate

- **모델:** Replicate 8bit Diffusion
- **결과:**  
  - 응답 속도 너무 느림
  - GPU token 비용 부담 큼
- **결론:**  
  - MVP에서 비효울적이라고 판단

---

### Study #2 - PixelLab API

- **모델:** Pixel Art 기본 모델
- **결과:**  
  - 월간 무료 호출 없음, Starter 플랜 $12~19 필요  
  - 사용법은 간단하지만 비용 부담스러움
- **결론:**  
  - 보류

---

### Study #3 - OpenAI DALL·E

- **프롬프트 예시:**  
  "64x64 pixel art of a duck character, NES 8bit style, minimal details"
- **결과:**  
  - 응답 속도 20초 내외
  - 출력 해상도는 256x256 이상 → Canvas에서 downscale + pixelate 처리 가능
- **결론:**  
  - 결국은 openai구나

### API docs
https://platform.openai.com/docs/api-reference/evals

## Canvas
https://velog.io/@mokyoungg/JS-JS%EC%97%90%EC%84%9C-Canvas-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0%EB%A7%88%EC%9A%B0%EC%8A%A4%EB%A1%9C-%EA%B7%B8%EB%A6%AC%EA%B8%B0

- react-colorful
https://www.npmjs.com/package/react-colorful
>HexColor - #ffffff (string) << 얘 사용
>HslColor - { h: 0-360, s: 0-1, l: 0-1 } (object)

- color-thief-browser
for 핵심 컬러 추출
https://goni9071.tistory.com/411

### 시나리오
1. 작품 업로드 : 프론트 > 이미지 업로드 > IPFS 업로드 > URI 생성
2. 오프체인 투표생성 : 백엔드 > 투표생성 > DB저장 > 프엔에 투표 시작 알림
3. 사용자 투표 : 사용자 > 투표 > 백엔드에서 DB 업데이트 > 투표수 증가
4. 승인 조건 : 백엔드에서 투표수 확인 > ??개 달성 > 자동 민팅
5. NFT 민팅 : Backend > ArtworkNFT.mintApprovedArtwork() 호출 > 블록체인 실행 > NFT 생성
6. 민팅 완 : 아티스트 > NFT 소유권 확보 > 100% 로열티 > 거래 가능