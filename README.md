## EXPO

<img width="5760" height="3240" alt="image" src="https://github.com/user-attachments/assets/95a43eb9-ae53-4dd6-b63a-f5fc7ad34fce" />

광주광역시 교육청 외주 프로젝트로, 교육 행사·축전의 디지털 운영 효율화를 목표로 개발한 서비스입니다.
- 관리자는 행사·축전을 생성하고 참가자 폼 및 만족도 조사를 동적으로 구성·배포할 수 있으며, 참가자는 문자로 전달된 QR 코드를 통해 출입을 인증하고 즉시 만족도 조사에 참여할 수 있습니다. 
- 수집된 모든 데이터는 Excel로 자동 정리되어, 행사 운영 통계와 교육청 정책 의사결정에 활용될 수 있도록 설계했습니다.

## How to Clone?

```
 git clone https://github.com/School-of-Company/Expo-Client.git
```

## Server Environment

운영(Vercel) 프로젝트 환경 변수에 넣는 서버 전용 값입니다. `NEXT_PUBLIC_` 이 붙지 않아 브라우저 번들에 들어가지 않습니다.

| 이름 | 값 | 설명 |
| --- | --- | --- |
| `BASE_URL` | Gateway 주소 | Next 서버가 부르는 Gateway. 없으면 `NEXT_PUBLIC_BASE_URL`을 씁니다. |
| `TRUSTED_PROXY_HOPS` | Next 앞에서 `X-Forwarded-For`를 덧붙이는 프록시 수(예: nginx 하나면 `1`, CloudFront → ALB면 `2`) | 이 값이 있어야 Next 프록시가 사용자 IP를 Gateway에 넘깁니다. Gateway는 그 IP로 로그인·인증번호·문자 발송 요청 수를 제한합니다. **설정하지 않으면** IP를 넘기지 않아 모든 사용자가 Next 서버 IP 하나로 묶입니다(위조한 IP로 한도를 피하지 못하게 하기 위한 기본값). 앞단 구성이 바뀌면 함께 바꿔야 합니다. Vercel은 `x-forwarded-for`를 사용자 IP로 덮어쓰므로 `1`입니다. |
| `GATEWAY_BFF_TOKEN` | Gateway Vault `secret/gateway`의 `bff.token`과 같은 값(32~256자) | Vercel 함수는 나가는 IP가 고정이 아니라 Gateway가 IP로 BFF를 믿을 수 없습니다. Next 프록시가 사용자 IP를 넘길 때 이 값을 `X-Bff-Token` 헤더로 함께 보내고, Gateway는 토큰이 맞을 때만 그 IP로 요청 수를 셉니다. **설정하지 않으면** 모든 사용자가 Vercel IP 하나로 묶여 한도를 함께 씁니다. `NEXT_PUBLIC_`을 붙이지 않습니다. |

헤더의 **미래교육박람회** 메뉴는 `NEXT_PUBLIC_FUTURE_EDU_EXPO_ID`(박람회 UUID)를 넣으면 그 박람회 대시보드로 바로 가고, 없으면 제목에 '미래교육박람회'가 들어간 박람회를 찾아 들어갑니다. 행사가 끝나면 `src/entities/layout/Header/model/navigationItems.ts`에서 메뉴 한 줄을 지웁니다.

## Contributing

- 버그 제보: [이슈 트래커](https://github.com/School-of-Company/Expo-Client/issues)에 제보할 버그를 작성합니다.
- 기능 제안: [이슈 트래커](https://github.com/School-of-Company/Expo-Client/issues)에 제안하고 싶은 기능을 작성합니다.
- 코드 기여: GitHub에서 코드를 Fork하고, Pull Request를 보냅니다.

## Node Version

### Dependencies

> [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) ^5.59.14 <br> [axios](https://www.npmjs.com/package/axios) ^1.7.7 <br> [next](https://www.npmjs.com/package/next) 14.2.15 <br> [react](https://www.npmjs.com/package/react) ^18 <br> [react-dom](https://www.npmjs.com/package/react-dom) ^18 <br> [react-toastify](https://www.npmjs.com/package/react-toastify) ^10.0.6 <br> [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate) ^1.0.7 <br> [zustand](https://www.npmjs.com/package/zustand) ^5.0.0

### DevDependencies

> [@chromatic-com/storybook](https://www.npmjs.com/package/@chromatic-com/storybook) ^1.9.0 <br> [@storybook/addon-essentials](https://www.npmjs.com/package/@storybook/addon-essentials) ^8.3.5 <br> [@storybook/addon-interactions](https://www.npmjs.com/package/@storybook/addon-interactions) ^8.3.5 <br> [@storybook/addon-links](https://www.npmjs.com/package/@storybook/addon-links) ^8.3.5 <br> [@storybook/addon-onboarding](https://www.npmjs.com/package/@storybook/addon-onboarding) ^8.3.5 <br> [@storybook/blocks](https://www.npmjs.com/package/@storybook/blocks) ^8.3.5 <br> [@storybook/nextjs](https://www.npmjs.com/package/@storybook/nextjs) ^8.3.5 <br> [@storybook/react](https://www.npmjs.com/package/@storybook/react) ^8.3.5 <br> [@storybook/test](https://www.npmjs.com/package/@storybook/test) ^8.3.5 <br> [@types/node](https://www.npmjs.com/package/@types/node) ^20 <br> [@types/react](https://www.npmjs.com/package/@types/react) ^18 <br> [@types/react-dom](https://www.npmjs.com/package/@types/react-dom) ^18 <br> [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin) ^7.18.0 <br> [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser) ^7.18.0 <br> [eslint](https://www.npmjs.com/package/eslint) ^8.57.1 <br> [eslint-config-airbnb-typescript](https://www.npmjs.com/package/eslint-config-airbnb-typescript) ^18.0.0 <br> [eslint-config-next](https://www.npmjs.com/package/eslint-config-next) 14.2.15 <br> [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) ^9.1.0 <br> [eslint-import-resolver-alias](https://www.npmjs.com/package/eslint-import-resolver-alias) ^1.1.2 <br> [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier) ^5.2.1 <br> [eslint-plugin-storybook](https://www.npmjs.com/package/eslint-plugin-storybook) ^0.9.0 <br> [husky](https://www.npmjs.com/package/husky) ^9.1.6 <br> [lint-staged](https://www.npmjs.com/package/lint-staged) ^15.2.10 <br> [postcss](https://www.npmjs.com/package/postcss) ^8 <br> [prettier](https://www.npmjs.com/package/prettier) ^3.3.3 <br> [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss) ^0.6.8 <br> [storybook](https://www.npmjs.com/package/storybook) ^8.3.5 <br> [tailwindcss](https://www.npmjs.com/package/tailwindcss) ^3.4.1 <br> [typescript](https://www.npmjs.com/package/typescript) ^5.4.2
