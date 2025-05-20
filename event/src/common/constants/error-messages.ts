// src/common/constants/error-messages.ts
import { ErrorCode } from '../enums/error-code.enum';

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NOT_FOUND]:          '요청하신 리소스를 찾을 수 없습니다.',
  [ErrorCode.DUPLICATE_RESOURCE]: '이미 존재하는 리소스입니다.',
  [ErrorCode.UNAUTHORIZED]:       '권한이 없습니다. 로그인 후 다시 시도해 주세요.',
  [ErrorCode.FORBIDDEN]:          '접근 권한이 없습니다.',
  [ErrorCode.VALIDATION_FAILED]:  '입력 값이 유효하지 않습니다.',
  [ErrorCode.ALREADY_EXISTS]:     '이미 존재하는 정보 입니다.',
  [ErrorCode.NOT_EXISTS]:         '존재하지 않는 정보 입니다.',
  [ErrorCode.CONDITION_NOT_MET]:  '조건이 충족되지 않습니다.',
  [ErrorCode.INVALID_ARGUMENT]:   '잘못된 입력값입니다.',
  [ErrorCode.ALREADY_CLAIMED]:    '이미 요청되었거나 수령되었습니다.',
  [ErrorCode.NO_PROGRESS]:        '진행 이력이 존재하지 않습니다.',
};