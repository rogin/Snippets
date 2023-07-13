
# Service Ideas

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#interop-for-pharmacy-inventory">InterOp for Pharmacy Inventory</a></li>
  </ol>
</details>

## InterOp for Pharmacy Inventory

Chat [link](https://mirthconnect.slack.com/archives/CFMP7CNHX/p1688674954765619)

_jonb_
Is anyone doing interop for pharmacy inventory?
Just got hit with a “we dont have this drug in, you use your time to call around to all the pharmacists in town and see if they have it”. Surely there should be a way to broadcast the drug, dose, and insurance group without disclosing PHI/PII to get a response back from the pharmacies with inventory and pricing. I’m mildly annoyed but like if someone is really sick or working-poor and can’t call around what are they supposed to do? This feels like a solvable problem

_joshm_
generally, my pharmacy has called around to other locations in effort to locate it for me. They even called a competitor because they couldn’t get it at one of their own stores. Granted, that’s still a lot of manual effort that could be solved with an API or similar. Then you just have to call one place to verify accuracy of the inventory. feels like a natural extension of something like GoodRx.

_jonb_
I’m happy to have GoodRx in the market but it feels scammy. Since if you buy thru GoodRx it doesn’t hit your deductible so insurance still wins. Or when I’m buying $100s in meds they hand me a coupon, that feels really careless and cheap.

_CreepySheep_
so what shall we do about this drug inventory situation? Mirth based API to query pharmacies' inventory systems?

_jonb_
roughly yes. if they expose those inventories at all.

_Anthony Master_
We do but only inter hospital between Pyxis machines. We don't communicate those pulls/inventory external to our hospital.
So how does something like this become a thing? Our town could use it too from my own experience, we have half a dozen or more pharmacies in town and they run into the same problem from my customer perspective. What would it take to get on board the big ones like Walmart, CVS, Walgreens? And there would have to be some kind of local to it as well, I don't see a need to usually know if three states over has something.

_jonb_
Geolocation is important, I assume openmaps would be close enough
The risks with getting buy in from ANY pharmacy, big or small would probably be:

1. Having a queryable API
1. Dealing with any PII/PHI issues, even if we don't send PII/PHI they'd likely want a BAA in place
1. I am assuming that none of the participants want open, up-front pricing because if they did they would have solved this already and be able to advertise prices

actually due to prescribing regs we can probably limit it to in state... how does that work? Can a doc in Ohio prescribe in Indiana?

_Anthony Master_
IMO, It would be harder to get a buy-in for an event based messaging that sends all of the Pharmacy's inventory to the Cloud somewhere to be stored in a db to be queryable by others. I think though, that if you play it off like, let's just automate what we already do. And not even need to share the price, just if needed quantity is on hand and available. So a workflow like this maybe:

1. Pharmacy receives a rx
1. Checks local inventory and cannot meet rx quantity
1. Sends a query out to a central API to check for nearby avail
1. Central API sends query out to (preset range/agreed parties) to check for specific avail
1. Other Pharmac(y|ies) receive query for avail from inventory
1. Other Pharmac(y|ies) respond with yes/no can meet request
1. After allotted timeout or after all selected Pharmac(y|ies) reply, Central API sends out the tallied reply to the original requestor.

This would not need to long time store inventories in the cloud, and a Pharmacy could even make their own reply process less automated in case of lacking interrop experts. For instance, Mom/Pa Pharmacy could interrop by email only, and receive requests and reply via email instead of API. They might not be as fast, but can still be a part of the process if the timeout gives them enough time to receive the email, check their inventory, and reply.

I can talk to our veteran hospital pharmacist next week and see what his feedback is on this idea.

Maybe try to contact [this group](https://www.hcinnovationgroup.com/interoperability-hie/interoperability/news/53063666/onc-hitac-creates-pharmacy-interoperability-task-force)

And there is a [meeting scheduled for 7/12/23](https://www.healthit.gov/hitac/events/pharmacy-interoperability-and-emerging-therapeutics-task-force-2023-1),
I signed up for this zoom webinar, I wonder if I will have a voice or just be viewer/listener only?

_joshm_
Just having availability would probably be sufficient.
I dare say that MOST pharmacies will be relatively competitive on price.

_jonb_
Main committee page is [here](https://www.healthit.gov/hitac/committees/pharmacy-interoperability-and-emerging-therapeutics-task-force-2023). I have a tab open to skim their publications

_Anthony Master_'s pharmacist:
_In years past the pharmacist would call the other pharmacies in town to locate a medication for their patient. Currently with the issues with the supply chain for meds being so challenging each pharmacy will have 15-20 out of stock situations and also have 50-100 prescriptions not picked up each week. With these issues and the one you presented you can understand why the pharmacy askes the patient to locate the medication. I really like your solution but don’t see very many people having the time or resources to implement._

_jonb_
The time cost to the pharmacies might be a good proposition, I sat on hold for three pharmacies, 10 minutes each. 30 minutes of time for a pharmacist or tech gets costly.
