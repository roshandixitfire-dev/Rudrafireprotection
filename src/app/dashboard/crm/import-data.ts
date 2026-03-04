// This is a temporary file to assist in importing the large dataset provided by the user.
// I will extract a large chunk of the data and use the bulkCreateLeadsAction.

export const RAW_LEAD_DATA = `
1	AS001	10/12/2012	WOM	qualified	HOT	Santakruz	Runwal symphony	Runwal developers pvt.ltd	Gr+Bas+Pod+15fl	15 Fl compl	Sandeep runwal	Manisha Thakur	Mr.sameer patil	Vivek bhole	
2	AS013/1		referral	qualified	Hot	Borivali	samarpan exotica	Kanakia Spaces				Sabir			Call on 6 pm
3	AS013/2	16/03/2013	referral	Quoted	Hot	Borivali	satra park	satra group		80%		vinod pokharkar 987004200			incorrect number 19/08/16
4	AS002	16/10/2012	WOM	incoming	warm	Mumbai(e)	Mahada project	B.G.shirkhe	22 floor	16 fl comp	Mahada	Addle	Mr.s.l.chowke	Hafiz	
5	AS013/3		referral	Win	Hot	Andheri	gujrati samaj	M/S satra properties	gr+7 upper flr	completed		vinod pokharkar 987004200		pagnis	incorrect no 19/08/16
6	AS003	17/10/2012	WOM	Lost	HOT	Kandivali	Jeevandeep	Mahaveer developers	s+3 p0d+20 flr	16 th flr		98202 30931			Not receving call
7	AS013/4		referral	quated	Hot	Andheri	stertling	key stone realtor	ba+g+7+r/b+g+7+comm	completed		Mr. Satish,66766888		
8	AS004	17/10/2012	WOM	incoming	HOT	Kandivali	Veer tower	Bhadra enterpress	7pod+10fl+30 flr	3 years	Nimesh Shah-9324246348	Alpesh Dhrod/9867740654	Rahul Shah		
9		12/1/2016	WOM			Lower parel		kamala group			Mahendra Rao	Nilam madam/24982428			
10		7/3/2015	Times of India			Goregaon (w)	Arista	Sahajanand Developers				Girish -28719800			
11	AS005	17/10/2012	WOM	incoming	HOT	Kandivali	Blue impress	atul developer	22 flr	2 years		Dinesh - 26836357	sales@atulprojects.com		
12	AS013/6		WOM	quated	hot	Borivali west	Crystal height, Borivali	Nirala Construction				Amit Jain/9819940839	nirala constructus@ymail.com		
13	AS013/7	3/8/2013	WOM	Quated	Hot	Vashi		Concrete Builders				vishal tapase 9270323677/8097924781	vishal tapase	metita	
14	AS007	20/12/2012	WOM	3 years	HOT	Borivali	Nirvana	kamala land mark	gr+7pod+47 flr	3years		santosh bhai 67898100	mr.pandy9920211628	Vivek bhole	
15	AS008	20/12/2012	WOM	2 to 3 yr	hot	Borivali	Kamala enterprises	kamala group	bas+pod+21 floor	22 flr	k.t.gowani	lekraj 24982426	yadavji9987067236	skyline	rejected
`.trim();

export function parseLeads(raw: string) {
    const lines = raw.split('\n');
    return lines.map(line => {
        const parts = line.split('\t');
        return {
            sr_no: parts[0] || '',
            sales_form_no: parts[1] || '',
            sales_form_date: parts[2] || '',
            source: parts[3] || '',
            stage: parts[4] || '',
            category: parts[5] || '',
            location: parts[6] || '',
            project_name: parts[7] || '',
            developer: parts[8] || '',
            configuration: parts[9] || '',
            const_status: parts[10] || '',
            owner_name: parts[11] || '',
            finalizing_authority: parts[12] || '',
            site_incharge: parts[13] || '',
            architect: parts[14] || '',
            remarks: parts[15] || '',
        };
    });
}
