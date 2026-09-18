$baseUrl = "http://localhost:3000"
$allPassed = $true

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NEXORA SECURITY AUDIT & IDOR DEFENSE TEST SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$Action,
        [int[]]$ExpectedStatus
    )
    Write-Host "`n[TEST] $TestName" -ForegroundColor Yellow
    try {
        $resp = & $Action
        $statusCode = [int]$resp.StatusCode
        $content = $resp.Content
        Write-Host "  Response Status: $statusCode" -ForegroundColor Gray
        if ($ExpectedStatus -contains $statusCode) {
            Write-Host "  PASS [Status $statusCode matches expected ($($ExpectedStatus -join ', '))]" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  FAIL: Expected status ($($ExpectedStatus -join ', ')) but got $statusCode" -ForegroundColor Red
            Write-Host "  Response: $content" -ForegroundColor Red
            return $false
        }
    } catch {
        $ex = $_.Exception
        if ($ex.Response) {
            $statusCode = [int]$ex.Response.StatusCode
            Write-Host "  Response Status: $statusCode" -ForegroundColor Gray
            if ($ExpectedStatus -contains $statusCode) {
                Write-Host "  PASS [Status $statusCode matches expected ($($ExpectedStatus -join ', '))]" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  FAIL: Expected status ($($ExpectedStatus -join ', ')) but got $statusCode" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  ERROR: $($ex.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Test 1: IDOR GET Defense
$t1 = Run-Test -TestName "1. IDOR GET Defense (Accessing portfolio with ?userId=victim-123 without auth)" -ExpectedStatus @(401, 403) -Action {
    Invoke-WebRequest -Uri "$baseUrl/api/games/game-algorithmic-alpha?userId=victim-12345" -Method Get -TimeoutSec 5
}
if (-not $t1) { $allPassed = $false }

# Test 2: IDOR Trade Execution Defense
$t2 = Run-Test -TestName "2. IDOR Trade Execution Defense (POST trade on behalf of victim-123 without auth)" -ExpectedStatus @(401, 403) -Action {
    $body = @{ userId = "victim-12345"; ticker = "AAPL"; type = "BUY"; shares = 10 } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/games/game-algorithmic-alpha" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t2) { $allPassed = $false }

# Test 3: IDOR Tournament Join Defense
$t3 = Run-Test -TestName "3. IDOR Tournament Join Defense (Joining victim-123 to tournament without auth)" -ExpectedStatus @(401, 403) -Action {
    $body = @{ userId = "victim-12345"; username = "Victim" } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/games/game-algorithmic-alpha/join" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t3) { $allPassed = $false }

# Test 4: IDOR Tournament Leave Defense
$t4 = Run-Test -TestName "4. IDOR Tournament Leave Defense (Wiping victim-123 portfolio without auth)" -ExpectedStatus @(401, 403) -Action {
    $body = @{ userId = "victim-12345" } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/games/game-algorithmic-alpha/leave" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t4) { $allPassed = $false }

# Test 5: Unauthorized Tournament Creation
$t5 = Run-Test -TestName "5. Unauthorized Tournament Creation (POST /api/games without auth session)" -ExpectedStatus @(401, 403) -Action {
    $body = @{ name = "Evil Spoofed Tournament"; creatorId = "victim-admin-id" } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/games" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t5) { $allPassed = $false }

# Test 6: Brute-Force Password Rate Limiting
Write-Host "`n[TEST] 6. Brute-Force Rate Limiting (Sending rapid password attempts to verify endpoint)" -ForegroundColor Yellow
$hitRateLimit = $false
for ($i = 1; $i -le 7; $i++) {
    try {
        $body = @{ password = "wrong_password_$i" } | ConvertTo-Json
        $r = Invoke-WebRequest -Uri "$baseUrl/api/games/game-algorithmic-alpha/verify" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host "  Attempt ${i}: Status $($r.StatusCode)" -ForegroundColor Gray
    } catch {
        $sc = [int]$_.Exception.Response.StatusCode
        Write-Host "  Attempt ${i}: Status ${sc}" -ForegroundColor Gray
        if ($sc -eq 429) {
            $hitRateLimit = $true
            Write-Host "  PASS: Rate limiter successfully triggered HTTP 429 Too Many Requests on attempt $i!" -ForegroundColor Green
            break
        }
    }
}
if (-not $hitRateLimit) {
    Write-Host "  FAIL: Rate limiter did not return 429" -ForegroundColor Red
    $allPassed = $false
}

# Test 7: Cloudflare Turnstile Missing Token Rejection
$t7 = Run-Test -TestName "7. Cloudflare Turnstile Missing Token Rejection (POST /api/auth/turnstile-verify with empty token)" -ExpectedStatus @(400, 403) -Action {
    $body = @{ token = "" } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/auth/turnstile-verify" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t7) { $allPassed = $false }

# Test 8: Cloudflare Turnstile Valid Token Acceptance
$t8 = Run-Test -TestName "8. Cloudflare Turnstile Test Token Acceptance (POST /api/auth/turnstile-verify with test token)" -ExpectedStatus @(200) -Action {
    $body = @{ token = "turnstile_test_token_ok" } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/api/auth/turnstile-verify" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
}
if (-not $t8) { $allPassed = $false }

# Test 9: HTTP Defensive Security Headers
Write-Host "`n[TEST] 9. HTTP Defensive Security Headers Verification" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/" -Method Get -TimeoutSec 5
    $h = $r.Headers
    $hasFrame = $h['X-Frame-Options'] -or $h['x-frame-options']
    $hasType = $h['X-Content-Type-Options'] -or $h['x-content-type-options']
    if ($hasFrame -and $hasType) {
        Write-Host "  PASS: Security headers present (X-Frame-Options: $hasFrame, X-Content-Type-Options: $hasType)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Missing security headers in response" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL: Error fetching headers: $_" -ForegroundColor Red
    $allPassed = $false
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host " ALL SECURITY AUDIT TESTS PASSED SUCCESSFULLY! (9/9)" -ForegroundColor Green
} else {
    Write-Host " SOME TESTS FAILED" -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
