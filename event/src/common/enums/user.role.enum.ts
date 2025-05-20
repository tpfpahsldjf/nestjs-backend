export enum UserRole {
  USER = 'USER',           // 보상 요청 가능
  OPERATOR = 'OPERATOR',   // 이벤트/보상 등록
  AUDITOR = 'AUDITOR',     // 이력 조회만 가능
  ADMIN = 'ADMIN',         // 모든 기능 접근
}