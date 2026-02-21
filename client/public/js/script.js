// Helper function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get today's date
function getTodayDate() {
    return formatDate(new Date());
}

function getCause(cause) {
    if (cause === 'Education and Children') return 'educationAndChildren';
    else if (cause === 'Health and Medicine') return 'healthAndMedical';
    else if (cause === 'Disaster Relief') return 'disasterRelief';
    else if (cause === 'Environment and Climate Change') return 'environmentAndClimate';
    else if (cause === 'Reducing Poverty and Hunger') return 'povertyAndHunger';
    else if (cause === 'Community Development') return 'communityDevelopment';
    else if (cause === 'Livelihood and Skills Training') return 'livelihoodAndSkillsTraining';
    else if (cause === 'Animal Welfare') return 'animalWelfare';
    return 'other';
}

document.addEventListener('DOMContentLoaded', function() {
	// POSTING PROJECTS
    const form = document.getElementById('postForm');
    const campaignTitle = document.getElementById('campaignTitle');
    const campaignLocation = document.getElementById('campaignLocation');
    const cause = document.getElementById('cause');
    const impactGoals = document.getElementById('impactGoals');
    const monetarySupport = document.getElementById('monetarySupport');
    const volunteerQuantity = document.getElementById('volunteerQuantity');

    // POSTING PROJECT Container for in-kind items and add button
    const inKindContainer = document.getElementById('inKindContainer');
    const addInKindBtn = document.getElementById('addInKind');

    addInKindBtn.addEventListener('click', () => {
		const newRow = document.createElement('div');
		newRow.classList.add('inKindRow');

		// Create Item Name input
		const itemInput = document.createElement('input');
		itemInput.type = 'text';
		itemInput.className = 'itemName';
		itemInput.placeholder = 'Item Name';

		// Create Quantity input
		const qtyInput = document.createElement('input');
		qtyInput.type = 'number';
		qtyInput.className = 'itemQuantity';
		qtyInput.placeholder = 'Quantity';

		// Create Unit input
		const unitInput = document.createElement('input');
		unitInput.type = 'text';
		unitInput.className = 'itemUnit';
		unitInput.placeholder = 'Unit';

		// Append inputs to the row
		newRow.appendChild(itemInput);
		newRow.appendChild(qtyInput);
		newRow.appendChild(unitInput);

		// Append the row to the container
		inKindContainer.appendChild(newRow);
	});

    // POSTING PROJECT Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // --- Step 1: Validate required fields ---
        if (!campaignTitle.value || !cause.value) {
            alert('Please fill in all required fields).');
            return;
        }

        // --- Step 2: Collect input values ---
        const projectName = campaignTitle.value;
        const campLocation = campaignLocation.value;
        const selectedCause = getCause(cause.value);
        const impact = impactGoals.value;
        const monetary = monetarySupport.value;
        const volunteers = volunteerQuantity.value;

        // --- Step 3: Collect all in-kind items ---
        const inKindRows = document.querySelectorAll('.inKindRow');
        const inKindItems = Array.from(inKindRows).map(row => ({
            itemName: row.querySelector('.itemName').value,
            targetQuantity: Number(row.querySelector('.itemQuantity').value) || 0,
            unit: row.querySelector('.itemUnit').value
        })).filter(item => item.itemName); // remove empty rows

        // --- Step 4: Make supportTypes object ---
        const supportTypes = {
            monetary: {
                enabled: monetary ? true : false,
                targetAmount: monetary ? Number(monetary) : 0
            },
            inKind: inKindItems,
            volunteer: {
                enabled: volunteers ? true : false,
                targetVolunteers: volunteers ? Number(volunteers) : 0
            }
        };

        // --- Step 5: Make the payload for backend ---
        const payload = {
            projectName,
            location: campLocation,
            cause: selectedCause,
            impactGoals: impact,
            supportTypes
        };

        // --- Step 6: Send POST request ---
        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // --- Step 7: Handle response ---
            if (response.ok) {
                alert('Project posted successfully!');
                form.reset(); // reset the form
                // redirect to orgPosts page
                // window.location.href = '/postsPage.html';
            } else {
                alert(`Error: ${data.error || 'Failed to create project.'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again later.');
        }
    });
});