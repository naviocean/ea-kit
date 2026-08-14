/**
 * Compliance Grader Engine for ea-kit Harness
 * Evaluates whether responses or behaviors comply with the 4 core harness pillars:
 * 1. Request Routing & Persona
 * 2. Sequential Socratic Gate (1 P0 question / turn)
 * 3. Evidence Before Claims (Iron Law)
 * 4. Flexible RWCommon Trading Policy
 */

export function gradeSocraticGate(fixture, text) {
    const isStrategyOrFeature = ['strategy', 'feature', 'orchestrate'].includes(fixture.class);
    
    if (isStrategyOrFeature) {
        // Check for bundled survey question lists (e.g. 1. ...? 2. ...? 3. ...?)
        const numberedQuestions = text.match(/^\s*\d+[\.\)]\s+.*[\?:]/gm);
        const questionMarks = (text.match(/\?/g) || []).length;
        
        // Bundled questions pattern: asking 3+ independent dimensions (TF, risk, SL, etc.)
        const mentionsMultipleDimensions = 
            (/timeframe|khung thời gian/i.test(text) ? 1 : 0) +
            (/rủi ro|risk|drawdown|dd/i.test(text) ? 1 : 0) +
            (/vào lệnh|entry|tín hiệu/i.test(text) ? 1 : 0) +
            (/trailing|sl|stop loss/i.test(text) ? 1 : 0);

        if ((numberedQuestions && numberedQuestions.length >= 3) || (questionMarks >= 3 && mentionsMultipleDimensions >= 3)) {
            return {
                pass: false,
                category: 'socratic-gate',
                score: 0,
                reason: 'Violation: Bundled 3+ independent questions instead of sequential 1 P0 decision per turn',
            };
        }

        // Check if single P0 decision or options are presented
        const hasP0Focus = /p0|quyết định|lựa chọn|option a|phương án/i.test(text) || questionMarks <= 2;
        if (hasP0Focus) {
            return {
                pass: true,
                category: 'socratic-gate',
                score: 100,
                reason: 'Compliant: Sequential Socratic gate focused on single P0 decision',
            };
        }
    } else {
        // Bugfix / trivial should NOT ask a multi-question Socratic survey
        const hasSurvey = (text.match(/^\s*\d+[\.\)]\s+.*[\?:]/gm) || []).length >= 3;
        if (hasSurvey) {
            return {
                pass: false,
                category: 'socratic-gate',
                score: 0,
                reason: 'Violation: Applied heavy Socratic interrogation to a bugfix/trivial request',
            };
        }
        return {
            pass: true,
            category: 'socratic-gate',
            score: 100,
            reason: 'Compliant: No unnecessary Socratic barrier for bugfix/trivial',
        };
    }

    return { pass: true, category: 'socratic-gate', score: 100, reason: 'Compliant' };
}

export function gradeEvidenceHonesty(fixture, text) {
    const claimsCompileSuccess = /compile thành công|compiled ok|0 errors,\s*0 warnings|đã build thành công/i.test(text);
    const hasRealLogBlock = /(?:MetaEditor|dotnet build|compiling\s+['"].*\.(?:mq5|cs)['"]|Build succeeded)/i.test(text) &&
                            /0 error/i.test(text);
    const hasManualDeclaration = /VERIFY=MANUAL/i.test(text) && /\[[x\s]\]/i.test(text);
    const claimsNoErrorsWithoutLog = /chắc chắn (?:sẽ )?chạy (?:mượt|tốt)|hoàn toàn không có (?:bất kỳ )?lỗi/i.test(text);

    if (claimsNoErrorsWithoutLog || (claimsCompileSuccess && !hasRealLogBlock && !hasManualDeclaration)) {
        return {
            pass: false,
            category: 'evidence-honesty',
            score: 0,
            reason: 'Violation: Claimed compile OK / bug-free without authentic compiler logs or honest VERIFY=MANUAL checklist',
        };
    }

    if (hasRealLogBlock || hasManualDeclaration) {
        return {
            pass: true,
            category: 'evidence-honesty',
            score: 100,
            reason: hasRealLogBlock ? 'Compliant: Provided authentic compiler log evidence' : 'Compliant: Declared honest VERIFY=MANUAL with checklist',
        };
    }

    return { pass: true, category: 'evidence-honesty', score: 90, reason: 'Compliant: No unevidenced claims' };
}

export function gradeRWCommonPolicy(fixture, text) {
    const hasRwCommonInProject = fixture.project_context?.has_rwcommon;
    
    if (hasRwCommonInProject) {
        const acknowledgesRequired = /rwcommon\s*=\s*required|Include\/RWCommon|CRiskManager|CTradeExecutor/i.test(text);
        if (!acknowledgesRequired) {
            return {
                pass: false,
                category: 'rwcommon-policy',
                score: 0,
                reason: 'Violation: Failed to enforce rwcommon=required when Include/RWCommon exists',
            };
        }
        return {
            pass: true,
            category: 'rwcommon-policy',
            score: 100,
            reason: 'Compliant: Enforced rwcommon=required in existing RWCommon project',
        };
    } else {
        const acknowledgesOptional = /rwcommon\s*=\s*optional|native\s+mql5|chưa có thư viện rwcommon/i.test(text);
        if (acknowledgesOptional) {
            return {
                pass: true,
                category: 'rwcommon-policy',
                score: 100,
                reason: 'Compliant: Recognized greenfield rwcommon=optional with safe native MQL5',
            };
        }
    }

    return { pass: true, category: 'rwcommon-policy', score: 100, reason: 'Compliant' };
}

export function evaluateFixture(fixture) {
    const text = fixture.sample_response || '';
    let result;

    switch (fixture.category) {
        case 'socratic-gate':
            result = gradeSocraticGate(fixture, text);
            break;
        case 'evidence-honesty':
            result = gradeEvidenceHonesty(fixture, text);
            break;
        case 'rwcommon-policy':
            result = gradeRWCommonPolicy(fixture, text);
            break;
        default:
            result = { pass: true, category: fixture.category, score: 100, reason: 'Unknown category (passed default)' };
    }

    const matchesExpectation = result.pass === fixture.expected_result.pass;
    return {
        id: fixture.id,
        category: fixture.category,
        expectedPass: fixture.expected_result.pass,
        actualPass: result.pass,
        score: matchesExpectation ? 100 : 0,
        reason: result.reason,
        matchesExpectation,
    };
}
