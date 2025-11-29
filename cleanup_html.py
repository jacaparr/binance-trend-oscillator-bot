"""
Script to clean up the corrupted index.html file by removing duplicate functions
"""

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where resetToDefaultParams starts (should be around line 1871)
reset_start = None
for i, line in enumerate(lines):
    if 'function resetToDefaultParams()' in line:
        reset_start = i
        break

if reset_start is None:
    print("ERROR: Could not find resetToDefaultParams function")
    exit(1)

print(f"Found resetToDefaultParams at line {reset_start + 1}")

# Find the proper end of resetToDefaultParams (the closing brace after the if statement)
# We need to find the complete function
brace_count = 0
in_function = False
reset_end = None

for i in range(reset_start, len(lines)):
    line = lines[i]
    
    if '{' in line:
        brace_count += line.count('{')
        in_function = True
    if '}' in line:
        brace_count -= line.count('}')
    
    if in_function and brace_count == 0:
        reset_end = i
        break

if reset_end is None:
    print("ERROR: Could not find end of resetToDefaultParams")
    exit(1)

print(f"resetToDefaultParams ends at line {reset_end + 1}")

# Now we need to add the event listeners and error overlay after resetToDefaultParams
new_ending = """
                // ========= UI CONTROL HANDLERS =========
                // Handle Stop Loss Type changes
                document.getElementById('stopLossType').addEventListener('change', function() {
                    const slType = this.value;
                    const slMultiplierGroup = document.getElementById('slMultiplierGroup');
                    const slPercentGroup = document.getElementById('slPercentGroup');
                    
                    if (slType === 'smart') {
                        slMultiplierGroup.style.display = 'block';
                        slPercentGroup.style.display = 'none';
                    } else if (slType === 'fixed') {
                        slMultiplierGroup.style.display = 'none';
                        slPercentGroup.style.display = 'block';
                    } else {
                        slMultiplierGroup.style.display = 'none';
                        slPercentGroup.style.display = 'none';
                    }
                });

                // Handle Take Profit Type changes
                document.getElementById('takeProfitType').addEventListener('change', function() {
                    const tpType = this.value;
                    const tpMultiplierGroup = document.getElementById('tpMultiplierGroup');
                    const tpPercentGroup = document.getElementById('tpPercentGroup');
                    
                    if (tpType === 'smart') {
                        tpMultiplierGroup.style.display = 'block';
                        tpPercentGroup.style.display = 'none';
                    } else if (tpType === 'fixed') {
                        tpMultiplierGroup.style.display = 'none';
                        tpPercentGroup.style.display = 'block';
                    } else {
                        tpMultiplierGroup.style.display = 'none';
                        tpPercentGroup.style.display = 'none';
                    }
                });

                // ========= ERROR OVERLAY =========
                function ensureErrorOverlay() {
                    if (!document.getElementById('errorOverlay')) {
                        const div = document.createElement('div');
                        div.id = 'errorOverlay';
                        div.style.position = 'fixed';
                        div.style.top = '10px';
                        div.style.right = '10px';
                        div.style.zIndex = '9999';
                        div.style.maxWidth = '420px';
                        div.style.background = 'rgba(220,38,38,0.95)';
                        div.style.color = '#fff';
                        div.style.fontFamily = 'Inter, sans-serif';
                        div.style.fontSize = '12px';
                        div.style.padding = '12px 16px';
                        div.style.borderRadius = '10px';
                        div.style.boxShadow = '0 4px 18px rgba(0,0,0,0.4)';
                        div.style.display = 'none';
                        div.innerHTML = '<strong>Errores:</strong><br><ul style="margin:6px 0 0;padding-left:18px" id="errorList"></ul>';
                        document.body.appendChild(div);
                    }
                }
                function showErrorOverlay(err) {
                    ensureErrorOverlay();
                    const overlay = document.getElementById('errorOverlay');
                    const list = document.getElementById('errorList');
                    const li = document.createElement('li');
                    li.textContent = (err && err.message) ? err.message : String(err);
                    list.appendChild(li);
                    overlay.style.display = 'block';
                }
                window.addEventListener('error', ev => {
                    showErrorOverlay(ev.error || ev.message);
                });
                window.addEventListener('unhandledrejection', ev => {
                    showErrorOverlay(ev.reason);
                });

    </script>
</body>

</html>
"""

# Reconstruct the file: everything up to and including resetToDefaultParams, then the new ending
cleaned_lines = lines[:reset_end + 1] + [new_ending]

# Write the cleaned file
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"✅ File cleaned successfully!")
print(f"Original lines: {len(lines)}")
print(f"New lines: {len(cleaned_lines)}")
print(f"Removed {len(lines) - len(cleaned_lines)} duplicate lines")
